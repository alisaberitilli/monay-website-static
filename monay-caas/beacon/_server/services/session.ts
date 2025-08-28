import { createClient } from "@supabase/supabase-js";

import config from "#server/config";

const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const adminAuthClient = supabaseClient.auth.admin;

export default adminAuthClient;
