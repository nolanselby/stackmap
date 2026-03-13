const postgres = require('./node_modules/postgres');
const regions = [
  'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2'
];

async function check() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Checking ${region}...`);
    try {
      const sql = postgres(`postgresql://postgres.gyxfxycdarztyrfskoun:PrONEWer18%2B-@${host}:6543/postgres?sslmode=require`, { connect_timeout: 2 });
      await sql`SELECT 1`;
      console.log('FOUND IT! Region is', region);
      process.exit(0);
    } catch (e) {
      console.log(`  ${region}: ${e.message}`);
    }
  }
}
check();
