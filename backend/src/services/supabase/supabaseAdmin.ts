import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin client cannot be loaded on the client side.");
}

const createDummyAdminClient = () => {
  return new Proxy({} as any, {
    get() {
      return () => {
        throw new Error(
          "Supabase admin client called but environment variables are not set. Check SUPABASE_SERVICE_ROLE_KEY."
        );
      };
    },
  });
};

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : createDummyAdminClient();
