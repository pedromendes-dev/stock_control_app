import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anon =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Missing SUPABASE URL/ANON key in environment (.env).");
  process.exit(1);
}

const supabase = createClient(url, anon);

const email = process.env.TEST_USER_EMAIL || "test.user@example.com";
const password = process.env.TEST_USER_PASSWORD || "Test1234!";

console.log(`Trying to sign in as ${email}`);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Login error:", error.message || error);
    process.exit(1);
  }
  console.log("Login success, session:", data.session ? "present" : "none");
  console.log(data);
})();
