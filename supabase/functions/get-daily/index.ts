import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const messageFor = (wallet: string, nonce: string) =>
  `Ink GM Daily\nWallet: ${wallet}\nNonce: ${nonce}`;

const dayKey = () => new Date().toISOString().slice(0, 10);

const verifySignature = (wallet: string, nonce: string, signature: string) => {
  const message = messageFor(wallet, nonce);
  const recovered = ethers.verifyMessage(message, signature);
  return recovered.toLowerCase() === wallet.toLowerCase();
};

const verifyMint = async (wallet: string) => {
  const mintRequired = Deno.env.get("MINT_REQUIRED") === "true";
  if (!mintRequired) return true;
  const contractAddress = Deno.env.get("MINT_CONTRACT_ADDRESS");
  const rpcUrl = Deno.env.get("INK_RPC_URL");
  if (!contractAddress || !rpcUrl) return false;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const abi = ["function balanceOf(address owner) view returns (uint256)"];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const balance = await contract.balanceOf(wallet);
  return balance > 0n;
};

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

  const { wallet, nonce, signature } = await req.json();
  if (!wallet || !nonce || !signature) {
    return new Response(
      JSON.stringify({ ok: false, error: "AUTH_REQUIRED" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!verifySignature(wallet, nonce, signature)) {
    return new Response(
      JSON.stringify({ ok: false, error: "SIGNATURE_INVALID" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: nonceRow } = await supabase
    .from("auth_nonces")
    .select("nonce, used_at, created_at")
    .eq("wallet", wallet.toLowerCase())
    .single();

  if (!nonceRow || nonceRow.nonce !== nonce || nonceRow.used_at) {
    return new Response(
      JSON.stringify({ ok: false, error: "NONCE_INVALID" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const createdAt = new Date(nonceRow.created_at).getTime();
  if (Date.now() - createdAt > 10 * 60 * 1000) {
    return new Response(
      JSON.stringify({ ok: false, error: "NONCE_EXPIRED" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  await supabase
    .from("auth_nonces")
    .update({ used_at: new Date().toISOString() })
    .eq("wallet", wallet.toLowerCase());

  const hasAccess = await verifyMint(wallet);
  if (!hasAccess) {
    return new Response(
      JSON.stringify({ ok: false, error: "MINT_REQUIRED", code: "MINT_REQUIRED" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const todayKey = dayKey();
  const { data: todayClaim } = await supabase
    .from("daily_claims")
    .select("post_id")
    .eq("wallet", wallet.toLowerCase())
    .eq("day_key", todayKey)
    .maybeSingle();

  if (todayClaim?.post_id) {
    const { data: post } = await supabase
      .from("daily_posts")
      .select("id, text")
      .eq("id", todayClaim.post_id)
      .single();
    return new Response(
      JSON.stringify({ ok: true, post, dayKey: todayKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: posts } = await supabase
    .from("daily_posts")
    .select("id, text, position")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (!posts || posts.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, post: null, dayKey: todayKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: lastClaim } = await supabase
    .from("daily_claims")
    .select("post_id")
    .eq("wallet", wallet.toLowerCase())
    .order("claimed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentIndex = posts.findIndex((post) => post.id === lastClaim?.post_id);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % posts.length;
  const nextPost = posts[nextIndex];

  await supabase.from("daily_claims").insert({
    wallet: wallet.toLowerCase(),
    post_id: nextPost.id,
    day_key: todayKey,
  });

  return new Response(
    JSON.stringify({ ok: true, post: { id: nextPost.id, text: nextPost.text }, dayKey: todayKey }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
