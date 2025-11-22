const fs = require("fs");
const { Client } = require("pg");

async function run() {
  const conn = process.argv[2];
  const file = process.argv[3];
  if (!conn || !file) {
    console.error("Usage: node run_sql.js <connection-string> <sql-file>");
    process.exit(1);
  }

  const sql = fs.readFileSync(file, "utf8");
  const client = new Client({ connectionString: conn });

  try {
    await client.connect();
    console.log("Connected to DB. Executing SQL...");
    await client.query(sql);
    console.log("SQL executed successfully.");
  } catch (err) {
    console.error("Error executing SQL:", err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run();
