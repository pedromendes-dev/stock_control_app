#!/usr/bin/env node
// promote_user_to_admin.cjs
// Usage: node promote_user_to_admin.cjs --id <USER_ID> [--role superadmin]
// Requires environment variables: SERVICE_ROLE_KEY and PROJECT_REF

require("dotenv").config();
const fetch = global.fetch || require("node-fetch");

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.PROJECT_REF;

if (!SERVICE_ROLE_KEY || !PROJECT_REF) {
  console.error(
    "Missing SERVICE_ROLE_KEY or PROJECT_REF in environment. Set them in .env or export before running."
  );
  process.exit(2);
}

const argv = require("minimist")(process.argv.slice(2));
const userId = argv.id || argv.user || argv.u;
const role = argv.role || "superadmin";

if (!userId) {
  console.error(
    "Usage: node promote_user_to_admin.cjs --id <USER_ID> [--role superadmin]"
  );
  process.exit(2);
}

const url = `https://${PROJECT_REF}.supabase.co/rest/v1/admin_users`;

(async () => {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ user_id: userId, role }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("Error response from server:", resp.status, text);
      process.exit(1);
    }

    console.log("Promoted user, response:", text);
  } catch (err) {
    console.error("Request failed:", err);
    process.exit(1);
  }
})();
