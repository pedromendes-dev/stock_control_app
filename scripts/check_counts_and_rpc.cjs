const { Client } = require("pg");

async function main() {
  const conn = process.argv[2];
  if (!conn) {
    console.error("Usage: node check_counts_and_rpc.cjs <connection-string>");
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    console.log("Connected to DB");

    const queries = [
      { name: "categories", q: "SELECT count(*) AS cnt FROM categories;" },
      { name: "suppliers", q: "SELECT count(*) AS cnt FROM suppliers;" },
      { name: "products", q: "SELECT count(*) AS cnt FROM products;" },
      {
        name: "stock_movements",
        q: "SELECT count(*) AS cnt FROM stock_movements;",
      },
    ];

    for (const { name, q } of queries) {
      const res = await client.query(q);
      console.log(`${name}:`, res.rows[0].cnt);
    }

    console.log("\nCalling RPC get_dashboard_kpis()");
    const kpis = await client.query(
      "SELECT * FROM public.get_dashboard_kpis();"
    );
    console.log("get_dashboard_kpis result:", kpis.rows[0]);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

main();
