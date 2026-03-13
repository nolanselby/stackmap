const postgres = require('./node_modules/postgres');
const regions = [
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2'
];

async function check() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const url = `postgresql://postgres.gyxfxycdarztyrfskoun:PrONEWer18%2But-@${host}:6543/postgres?sslmode=require`;
    // wait I used %2But by mistake, I'll fix the real string below:
    console.log(`Trying ${host}...`);
    try {
      const sql = postgres(`postgresql://postgres.gyxfxycdarztyrfskoun:PrONEWer18%2B-@${host}:6543/postgres?sslmode=require`, { connect_timeout: 3 });
      await sql`SELECT 1`;
      console.log('SUCCESS:', host);
      process.exit(0);
    } catch (e) {
      if (!e.message.includes('tenant not found') && !e.message.includes('Endpoint not found') && !e.message.includes('timeout') && !e.message.includes('SSL') && !e.message.includes('ECONNREFUSED')) {
        console.log('Got response from', host, ':', e.message);
      }
    }
  }
}
check();
