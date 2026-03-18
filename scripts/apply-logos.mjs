/**
 * apply-logos.mjs
 *
 * Populates logo_url for every tool in the database using the Clearbit
 * Logo API (https://logo.clearbit.com/{domain}).
 *
 * The domain is derived from each tool's website_url by extracting the
 * root domain (e.g. gemini.google.com → google.com, firefly.adobe.com →
 * adobe.com). Only tools whose logo_url is currently NULL are updated
 * unless --force is passed.
 *
 * Usage:
 *   node scripts/apply-logos.mjs           # update only tools with no logo
 *   node scripts/apply-logos.mjs --force   # overwrite all logo_urls
 */

import { createClient } from '../apps/web/node_modules/@supabase/supabase-js/dist/index.cjs';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://gyxfxycdarztyrfskoun.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eGZ4eWNkYXJ6dHlyZnNrb3VuIiwi' +
  'cm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM3ODcxMiwiZXhwIjoyMDg4' +
  'OTU0NzEyfQ.ULjtfceAsOJzX6PH4692OqoEiKGo2O5ABZvER8qhO4w';

const FORCE = process.argv.includes('--force');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── Domain extraction ────────────────────────────────────────────────────────

/**
 * Extracts the root domain from a URL for use with the Clearbit Logo API.
 * Strips subdomains so that e.g. gemini.google.com → google.com and
 * firefly.adobe.com → adobe.com, giving Clearbit the best chance of
 * returning the correct company logo.
 *
 * Two-part hostnames (e.g. claude.ai, huggingface.co) are kept as-is.
 */
function getRootDomain(websiteUrl) {
  try {
    const { hostname } = new URL(websiteUrl);
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      // Return domain.tld (last two parts)
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return null;
  }
}

function getLogoUrl(websiteUrl) {
  const domain = getRootDomain(websiteUrl);
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching tools${FORCE ? ' (force mode — overwriting all)' : ' without logos'}…`);

  let query = supabase
    .from('tools')
    .select('id, slug, name, website_url, logo_url')
    .order('name');

  if (!FORCE) {
    query = query.is('logo_url', null);
  }

  const { data: tools, error } = await query;

  if (error) {
    console.error('Failed to fetch tools:', error.message);
    process.exit(1);
  }

  const withUrl   = tools.filter(t => t.website_url);
  const withoutUrl = tools.filter(t => !t.website_url);

  console.log(`  Found ${tools.length} tool(s) to update (${withoutUrl.length} skipped — no website_url)\n`);

  let updated = 0;
  let failed  = 0;

  for (const tool of withUrl) {
    const logoUrl = getLogoUrl(tool.website_url);

    if (!logoUrl) {
      console.log(`  [SKIP] ${tool.name} — could not parse URL: ${tool.website_url}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('tools')
      .update({ logo_url: logoUrl })
      .eq('id', tool.id);

    if (updateError) {
      console.error(`  [ERROR] ${tool.name}: ${updateError.message}`);
      failed++;
    } else {
      console.log(`  [OK]   ${tool.slug.padEnd(28)} → ${logoUrl}`);
      updated++;
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('Logo update summary');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Updated : ${updated}`);
  console.log(`  Failed  : ${failed}`);
  console.log(`  Skipped : ${withoutUrl.length} (no website_url)`);
  console.log('\nDone.');
}

main().catch(err => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
