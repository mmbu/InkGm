import {
  SUPABASE_ANON_KEY,
  SUPABASE_FUNCTIONS_URL,
  isSupabaseConfigured,
} from "../../../shared/config/supabase.js";

const request = async (path, payload) => {
  if (!isSupabaseConfigured()) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    const error = new Error(data?.error || "REQUEST_FAILED");
    error.code = data?.code;
    throw error;
  }
  return data;
};

export const issueNonce = (wallet) =>
  request("issue-nonce", { wallet });

export const fetchDailyPost = (wallet, signature, nonce) =>
  request("get-daily", { wallet, signature, nonce });
