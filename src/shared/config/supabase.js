export const SUPABASE_URL = "https://nzjxhhfacijgrawgtper.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_U8Ipn6IlijZlOtX_dbDA_w_VcSl0SqV";

export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export const isSupabaseConfigured = () =>
  !SUPABASE_URL.includes("YOUR_PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");
