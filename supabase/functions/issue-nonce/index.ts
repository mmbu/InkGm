import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateNonce = () =>
  crypto.getRandomValues(new Uint8Array(16)).reduce(
    (acc, byte) => acc + byte.toString(16).padStart(2, "0"),
    ""
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "SUPABASE_CONFIG_MISSING" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { wallet } = await req.json();
  if (!wallet) {
    return new Response(
      JSON.stringify({ ok: false, error: "WALLET_REQUIRED" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const nonce = generateNonce();

  const { error } = await supabase
    .from("auth_nonces")
    .upsert({ wallet: wallet.toLowerCase(), nonce, used_at: null }, { onConflict: "wallet" });

  if (error) {
    return new Response(
      JSON.stringify({ ok: false, error: "NONCE_SAVE_FAILED" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, nonce }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
