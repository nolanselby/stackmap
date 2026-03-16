/**
 * apply-seed.mjs
 *
 * Applies packages/db/supabase/seeds/001_tools_seed.sql to Supabase via the
 * REST API (supabase-js). No direct Postgres connection is used.
 *
 * Design
 * ──────
 * The seed SQL has multiple INSERT … ON CONFLICT DO NOTHING blocks per table,
 * each potentially with a different column list.  Two blocks for `tools` in
 * this seed file declare `long_description` in their column list but never
 * supply a value for it (their field count is one less than the column count).
 *
 * Handling strategy:
 *   1. Strip SQL line-comments so "(…)" inside comments cannot be mistaken for
 *      row tuples.
 *   2. Parse every INSERT block with a depth-aware tokeniser that tracks
 *      parentheses, brackets, and string literals.  ARRAY[…] values are kept
 *      intact by tracking [ / ] depth.
 *   3. Where a block has fewer fields per row than declared columns, identify
 *      the missing column(s) by cross-referencing all blocks for the same table:
 *      whichever declared column consistently has no corresponding field value
 *      is the missing one (filled with NULL).
 *   4. Build slug→id maps after seeding base tables, resolve subquery tokens,
 *      then upsert each block independently in chunks of 50.
 *
 * Usage:
 *   node scripts/apply-seed.mjs
 */

import { readFileSync } from 'fs';
import { createClient } from '../apps/web/node_modules/@supabase/supabase-js/dist/index.cjs';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://gyxfxycdarztyrfskoun.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGZ4eWNkYXJ6dHlyZnNrb3VuIiwi' +
  'cm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM3ODcxMiwiZXhwIjoyMDg4' +
  'OTU0NzEyfQ.ULjtfceAsOJzX6PH4692OqoEiKGo2O5ABZvER8qhO4w';
const SEED_FILE =
  '/Users/nolanselby/ai-tool-roadmapper/packages/db/supabase/seeds/001_tools_seed.sql';
const CHUNK_SIZE = 50;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── ID maps (slug → uuid) ────────────────────────────────────────────────────

const idMaps = {
  tools:          {},
  categories:     {},
  capabilities:   {},
  pricing_models: {},
};

// ─── SQL pre-processor ────────────────────────────────────────────────────────

/**
 * Strip SQL line-comments (-- … to end of line) while leaving content inside
 * string literals untouched.
 */
function stripLineComments(sql) {
  let out = '';
  let inString = false;
  let i = 0;

  while (i < sql.length) {
    const ch  = sql[i];
    const ch2 = sql[i + 1];

    if (inString) {
      out += ch;
      if (ch === "'" && ch2 === "'") { out += ch2; i += 2; continue; }
      if (ch === "'") inString = false;
      i++;
      continue;
    }

    if (ch === "'") { inString = true; out += ch; i++; continue; }

    if (ch === '-' && ch2 === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

// ─── Depth-aware splitter ─────────────────────────────────────────────────────

/**
 * Split `str` on `splitChar` only at the top grouping level — not inside
 * string literals, parentheses, or square brackets.
 */
function depthAwareSplit(str, splitChar) {
  const parts = [];
  let parenDepth   = 0;
  let bracketDepth = 0;
  let inString     = false;
  let start        = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (ch === "'" && str[i + 1] === "'") { i++; continue; }
      if (ch === "'") inString = false;
      continue;
    }

    switch (ch) {
      case "'": inString     = true;  break;
      case '(': parenDepth++;         break;
      case ')': parenDepth--;         break;
      case '[': bracketDepth++;       break;
      case ']': bracketDepth--;       break;
      default:
        if (ch === splitChar && parenDepth === 0 && bracketDepth === 0) {
          parts.push(str.slice(start, i).trim());
          start = i + 1;
        }
    }
  }

  const last = str.slice(start).trim();
  if (last.length > 0) parts.push(last);
  return parts;
}

// ─── Row-tuple splitter ───────────────────────────────────────────────────────

/**
 * Split a comment-stripped VALUES section into "(…)" tuple strings.
 * Handles nested parens (subqueries) and ARRAY[…] brackets.
 */
function splitRowTuples(valuesSection) {
  const rows = [];
  let parenDepth   = 0;
  let bracketDepth = 0;
  let inString     = false;
  let tupleStart   = -1;

  for (let i = 0; i < valuesSection.length; i++) {
    const ch = valuesSection[i];

    if (inString) {
      if (ch === "'" && valuesSection[i + 1] === "'") { i++; continue; }
      if (ch === "'") inString = false;
      continue;
    }

    switch (ch) {
      case "'": inString = true; break;
      case '[': bracketDepth++;  break;
      case ']': bracketDepth--;  break;
      case '(':
        if (parenDepth === 0) tupleStart = i;
        parenDepth++;
        break;
      case ')':
        parenDepth--;
        if (parenDepth === 0 && tupleStart !== -1) {
          rows.push(valuesSection.slice(tupleStart, i + 1));
          tupleStart = -1;
        }
        break;
    }
  }

  return rows;
}

function splitRowFields(rowTuple) {
  return depthAwareSplit(rowTuple.slice(1, rowTuple.length - 1), ',');
}

// ─── Type-hint helpers ────────────────────────────────────────────────────────

const BOOL_COLS = new Set([
  'open_source', 'self_hostable', 'api_available', 'status_active',
  'enterprise_only', 'free_tier', 'enterprise_ready', 'is_primary',
]);
const NUM_COLS = new Set([
  'founded_year', 'starting_price_monthly', 'est_cost_5_users',
  'est_cost_20_users', 'confidence', 'github_stars', 'producthunt_votes',
  'popularity_score', 'trust_score',
]);
const STR_COLS = new Set([
  'name', 'slug', 'canonical_name', 'company_name', 'website_url',
  'short_description', 'long_description', 'tool_type', 'lifecycle_status',
  'plan_name', 'pricing_model', 'notes', 'source_url', 'link_type', 'url',
  'source', 'strength', 'alternative_type', 'reason', 'capability_group',
  'category_type', 'description', 'github_url',
]);

function tokenType(tok) {
  const t = tok.trim();
  if (/^NULL$/i.test(t))                         return 'null';
  if (/^true$/i.test(t) || /^false$/i.test(t))  return 'bool';
  if (/^-?\d+(\.\d+)?$/.test(t))                return 'num';
  if (/^'/.test(t))                              return 'str';
  if (t.startsWith('(SELECT'))                   return 'uuid';
  if (/^ARRAY\[/i.test(t))                       return 'array';
  if (/^now\(\)/i.test(t))                       return 'ts';
  return 'other';
}

function isCompatible(colName, tok) {
  const tt = tokenType(tok);
  if (tt === 'null')  return true;
  if (tt === 'uuid')  return colName.endsWith('_id');
  if (BOOL_COLS.has(colName)) return tt === 'bool';
  if (NUM_COLS.has(colName))  return tt === 'num';
  if (STR_COLS.has(colName))  return tt === 'str';
  return true;
}

const URL_COLS = new Set(['github_url', 'website_url', 'source_url', 'url']);

/**
 * Count mismatches when the field list is mapped to the column list with
 * col[skipIdx] treated as NULL (i.e. that column has no value in this row).
 *
 * Scoring:
 *   +10 per hard type mismatch (bool in str col, etc.)
 *   +1  per semantic mismatch (URL-looking string in a non-URL str col like
 *       long_description — this catches the n8n github_url vs long_description
 *       ambiguity)
 */
function mismatchesWithSkip(fields, cols, skipIdx) {
  const effectiveCols = [...cols.slice(0, skipIdx), ...cols.slice(skipIdx + 1)];
  if (effectiveCols.length !== fields.length) return Infinity;
  let score = 0;
  for (let i = 0; i < effectiveCols.length; i++) {
    const col = effectiveCols[i];
    const tok = fields[i].trim();
    if (!isCompatible(col, tok)) { score += 10; continue; }
    // Semantic: URL-looking string in a non-URL string column
    if (STR_COLS.has(col) && !URL_COLS.has(col)) {
      // Check if the value looks like a URL
      const strM = tok.match(/^'((?:[^']|'')*)'$/);
      if (strM && /^https?:\/\//.test(strM[1])) score += 1;
    }
  }
  return score;
}

// ─── INSERT block extractor ───────────────────────────────────────────────────

/**
 * Raw block: table name, declared columns, and raw row tuples (un-parsed).
 * We keep all blocks for a table together so the missing-column analysis can
 * be done cross-block before we finalise column assignments.
 */
function parseRawBlocks(sql) {
  const blocks = [];
  const re =
    /INSERT\s+INTO\s+(\w+)\s*\(\s*([^)]+)\s*\)\s*VALUES\s*([\s\S]*?)\s*ON\s+CONFLICT\s+[\s\S]*?DO\s+NOTHING\s*;/gi;

  let m;
  while ((m = re.exec(sql)) !== null) {
    const table        = m[1];
    const declaredCols = m[2].split(',').map(c => c.trim());
    const rawRows      = splitRowTuples(m[3].trim());
    if (rawRows.length === 0) continue;
    blocks.push({ table, declaredCols, rawRows });
  }

  return blocks;
}

/**
 * Given all raw blocks for a single table, resolve any column-count mismatches
 * and return a list of finalised blocks:
 *   { columns: string[], rows: Array<Record<string, string>> }
 *
 * Mismatch handling (fields.length < declaredCols.length):
 *   For each position p in declaredCols, try removing declaredCols[p] and count
 *   type mismatches across the sample rows.  Among the positions with 0 mismatches,
 *   prefer the one whose removed column name does NOT appear in any other block
 *   for this table that has a matching field count (i.e. the column that is
 *   "never actually provided" across the whole table).
 */
function resolveBlocks(tableBlocks) {
  // First, gather field counts per block
  const blockInfos = tableBlocks.map(({ table, declaredCols, rawRows }) => {
    const sampleCount = splitRowFields(rawRows[0]).length;
    return { table, declaredCols, rawRows, sampleCount };
  });

  // Columns provided (with correct field count) across all blocks for this table
  const providedCols = new Set();
  for (const info of blockInfos) {
    if (info.sampleCount === info.declaredCols.length) {
      for (const col of info.declaredCols) providedCols.add(col);
    }
  }

  const finalised = [];

  for (const { table, declaredCols, rawRows, sampleCount } of blockInfos) {
    let effectiveCols = declaredCols;

    if (sampleCount < declaredCols.length) {
      const deficit = declaredCols.length - sampleCount;

      // For each declared col position, try removing it and score mismatches.
      // Use up to the first 5 rows as sample.
      // Use all rows as sample (not just the first 5) so rows with URL values
      // give the semantic URL-in-wrong-column penalty a chance to fire.
      const sampleRows = rawRows.map(splitRowFields);
      const scores = declaredCols.map((_, skipIdx) => {
        let total = 0;
        for (const fields of sampleRows) {
          total += mismatchesWithSkip(fields, declaredCols, skipIdx);
        }
        return total;
      });

      const minScore = Math.min(...scores);

      // Among zero-mismatch candidates, prefer columns that are NOT provided
      // in any other correctly-sized block (they're the "phantom" declarations).
      const candidates = scores
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s === minScore)
        .map(({ i }) => i);

      // Sort candidates: unprovided columns first (they're the likely phantom)
      // then by descending index (rightmost among same group = nullable extras)
      candidates.sort((a, b) => {
        const aUnprovided = !providedCols.has(declaredCols[a]) ? 0 : 1;
        const bUnprovided = !providedCols.has(declaredCols[b]) ? 0 : 1;
        if (aUnprovided !== bUnprovided) return aUnprovided - bUnprovided;
        return b - a; // rightmost first
      });

      // Remove the top `deficit` columns (in reverse index order to preserve positions)
      const skipIndices = candidates.slice(0, deficit).sort((a, b) => b - a);
      effectiveCols = [...declaredCols];
      for (const idx of skipIndices) {
        const removed = effectiveCols.splice(idx, 1)[0];
        console.log(
          `  [INFO] ${table}: "${removed}" declared but not provided in this block — will be NULL`
        );
      }
    }

    // Map each raw row tuple to a column→token map
    const parsedRows = [];
    for (const rowTuple of rawRows) {
      const fields = splitRowFields(rowTuple);

      if (fields.length > effectiveCols.length) {
        console.warn(
          `  [WARN] ${table}: row has ${fields.length} fields for ` +
          `${effectiveCols.length} effective columns — skipping.\n` +
          `    ${rowTuple.slice(0, 120)}`
        );
        continue;
      }

      const rowMap = {};
      for (let i = 0; i < effectiveCols.length; i++) {
        rowMap[effectiveCols[i]] = i < fields.length ? fields[i] : 'NULL';
      }
      parsedRows.push(rowMap);
    }

    finalised.push({ table, columns: effectiveCols, rows: parsedRows });
  }

  return finalised;
}

// ─── SQL value parser ─────────────────────────────────────────────────────────

/**
 * Convert a raw SQL token string to a JS value for upsert.
 *
 *   NULL            → null
 *   true / false    → Boolean
 *   now()           → ISO timestamp
 *   (SELECT id …)   → UUID from idMaps
 *   ARRAY[…]        → string[]
 *   'string'        → string  ('' → ')
 *   42 / 3.14       → number
 */
function parseFieldValue(raw) {
  const t = raw.trim();

  if (/^NULL$/i.test(t))    return null;
  if (/^true$/i.test(t))    return true;
  if (/^false$/i.test(t))   return false;
  if (/^now\(\)$/i.test(t)) return new Date().toISOString();

  // Subquery: (SELECT id FROM <table> WHERE slug='<slug>')
  const subq = t.match(
    /^\(\s*SELECT\s+id\s+FROM\s+(\w+)\s+WHERE\s+slug\s*=\s*'([^']*)'\s*\)$/i
  );
  if (subq) {
    const [, tbl, slug] = subq;
    const map = idMaps[tbl];
    if (!map)            throw new Error(`No ID map for table "${tbl}"`);
    if (!(slug in map))  throw new Error(`Unknown slug "${slug}" in ${tbl}`);
    return map[slug];
  }

  // ARRAY literal
  const arr = t.match(/^ARRAY\[([\s\S]*?)\]$/i);
  if (arr) {
    const inner = (arr[1] ?? '').trim();
    if (!inner) return [];
    return inner.split(',').map(item => {
      const s  = item.trim();
      const mm = s.match(/^'((?:[^']|'')*)'$/);
      return mm ? mm[1].replace(/''/g, "'") : s;
    });
  }

  // Single-quoted string
  const str = t.match(/^'((?:[^']|'')*)'$/s);
  if (str) return str[1].replace(/''/g, "'");

  // Number
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return t.includes('.') ? parseFloat(t) : parseInt(t, 10);
  }

  return t; // fallback
}

// ─── Upsert helper ────────────────────────────────────────────────────────────

async function upsertRows(table, rawRows, onConflict) {
  const resolved   = [];
  let parseSkipped = 0;

  for (const rowMap of rawRows) {
    let ok  = true;
    const obj = {};
    for (const [col, token] of Object.entries(rowMap)) {
      try {
        obj[col] = parseFieldValue(token);
      } catch (err) {
        console.warn(`  [WARN] ${table}: skipping row — ${err.message}`);
        ok = false;
        break;
      }
    }
    if (ok) resolved.push(obj);
    else parseSkipped++;
  }

  let upserted     = 0;
  let upsertFailed = 0;

  for (let i = 0; i < resolved.length; i += CHUNK_SIZE) {
    const chunk = resolved.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict, ignoreDuplicates: true });

    if (error) {
      console.error(
        `  [ERROR] ${table} chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${error.message}`
      );
      upsertFailed += chunk.length;
    } else {
      upserted += chunk.length;
    }
  }

  return { total: rawRows.length, parseSkipped, upserted, upsertFailed };
}

// ─── ID map builder ───────────────────────────────────────────────────────────

async function buildIdMap(table) {
  idMaps[table] = {};
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('id, slug')
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn(`  [WARN] Could not read ${table} for ID map: ${error.message}`);
      break;
    }
    if (!data?.length) break;

    for (const row of data) idMaps[table][row.slug] = row.id;
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return Object.keys(idMaps[table]).length;
}

// ─── Conflict keys per table ──────────────────────────────────────────────────

const CONFLICT_COLS = {
  categories:        'slug',
  capabilities:      'slug',
  tools:             'slug',
  tool_pricing:      'tool_id,plan_name',
  tool_metadata:     'tool_id',
  tool_links:        'tool_id,url',
  tool_categories:   'tool_id,category_id',
  tool_capabilities: 'tool_id,capability_id',
  tool_signals:      'tool_id',
  tool_alternatives: 'tool_id,alternative_tool_id,alternative_type',
};

const ORDERED_TABLES = [
  'categories',
  'capabilities',
  'tools',
  'tool_pricing',
  'tool_metadata',
  'tool_links',
  'tool_categories',
  'tool_capabilities',
  'tool_signals',
  'tool_alternatives',
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading seed file…');
  const rawSql = readFileSync(SEED_FILE, 'utf8');

  console.log('Stripping SQL comments…');
  const sql = stripLineComments(rawSql);

  console.log('Parsing INSERT blocks…');
  const rawBlocks = parseRawBlocks(sql);

  // Group raw blocks by table
  const rawByTable = new Map();
  for (const block of rawBlocks) {
    (rawByTable.get(block.table) ?? rawByTable.set(block.table, []).get(block.table))
      .push(block);
  }

  // Resolve column mismatches per table using cross-block analysis
  const byTable = new Map();
  for (const [table, tableRawBlocks] of rawByTable) {
    byTable.set(table, resolveBlocks(tableRawBlocks));
  }

  console.log(
    `  Found ${rawBlocks.length} INSERT blocks across ${rawByTable.size} tables: ` +
    [...rawByTable.keys()].join(', ') + '\n'
  );

  const summary = {};

  for (const table of ORDERED_TABLES) {
    const tableBlocks = byTable.get(table);
    if (!tableBlocks?.length) {
      console.log(`[SKIP] ${table} — no INSERT block found`);
      continue;
    }

    // Build ID maps before the first table needing subquery resolution
    if (table === 'tool_pricing') {
      console.log('Building slug→id maps…');
      const [nTools, nCats, nCaps, nPricing] = await Promise.all([
        buildIdMap('tools'),
        buildIdMap('categories'),
        buildIdMap('capabilities'),
        buildIdMap('pricing_models'),
      ]);
      console.log(
        `  tools: ${nTools}, categories: ${nCats}, ` +
        `capabilities: ${nCaps}, pricing_models: ${nPricing}\n`
      );
    }

    const onConflict = CONFLICT_COLS[table] ?? 'id';
    let totalRows         = 0;
    let totalUpserted     = 0;
    let totalParseSkipped = 0;
    let totalUpsertFailed = 0;

    for (const block of tableBlocks) {
      const stats = await upsertRows(table, block.rows, onConflict);
      totalRows         += stats.total;
      totalUpserted     += stats.upserted;
      totalParseSkipped += stats.parseSkipped;
      totalUpsertFailed += stats.upsertFailed;
    }

    const skipped = totalParseSkipped + totalUpsertFailed;
    console.log(
      `${table}: ${totalRows} rows, ${tableBlocks.length} block(s) → ` +
      `${totalUpserted} upserted` +
      (skipped ? `, ${skipped} skipped` : '')
    );

    summary[table] = {
      total: totalRows,
      upserted: totalUpserted,
      parseSkipped: totalParseSkipped,
      upsertFailed: totalUpsertFailed,
    };
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('Seed summary');
  console.log('═══════════════════════════════════════════════');
  for (const [table, s] of Object.entries(summary)) {
    const skipped = s.parseSkipped + s.upsertFailed;
    console.log(
      `  ${table.padEnd(24)} total=${String(s.total).padStart(4)}` +
      `  upserted=${String(s.upserted).padStart(4)}` +
      `  skipped=${skipped}`
    );
  }
  console.log('\nDone.');
}

main().catch(err => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
