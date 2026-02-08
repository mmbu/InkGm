import { qsa, qs } from "../../shared/lib/dom.js";
import { storage } from "../../shared/lib/storage.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import { onEvent } from "../../shared/lib/events.js";
import { getWalletState } from "../wallet/model/walletModel.js";
import { issueNonce, fetchDailyPost } from "../../entities/daily/api/dailyApi.js";
import { requestSignature } from "../auth/auth.js";

const STORAGE_KEY = "daily:unlocked";

const updateUi = (isUnlocked, dictionary) => {
  const badge = qs("[data-daily-status]");
  if (badge) {
    badge.textContent = isUnlocked
      ? dictionary.dailyStatusUnlocked
      : dictionary.dailyStatusLocked;
  }
};

const updateContent = (text, dictionary) => {
  const content = qs("[data-daily-content]");
  const textarea = qs("[data-daily-text]");
  const share = qs("[data-daily-share]");
  const copy = qs("[data-daily-copy]");
  if (!content || !textarea || !share || !copy) return;
  if (!text) {
    content.hidden = true;
    share.classList.add("is-disabled");
    return;
  }
  textarea.value = text;
  share.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}`;
  content.hidden = false;
  share.classList.remove("is-disabled");
};

export const initDaily = () => {
  let isUnlocked = storage.get(STORAGE_KEY, false);
  let dictionary = getDictionary(getStoredLanguage());
  let walletState = getWalletState();
  updateUi(isUnlocked, dictionary);
  updateContent("", dictionary);

  qsa("[data-daily-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!walletState.connected || !walletState.address) {
        showToast(dictionary.toastConnectToMint);
        return;
      }
      try {
        showToast(dictionary.toastDailyLoading);
        const nonceResponse = await issueNonce(walletState.address);
        const signature = await requestSignature(
          walletState.address,
          nonceResponse.nonce
        );
        const dailyResponse = await fetchDailyPost(
          walletState.address,
          signature,
          nonceResponse.nonce
        );
        if (!dailyResponse?.post?.text) {
          showToast(dictionary.dailyEmpty);
          updateContent("", dictionary);
          return;
        }
        updateContent(dailyResponse.post.text, dictionary);
        showToast(dictionary.toastDailyOpen);
        isUnlocked = true;
        storage.set(STORAGE_KEY, true);
        updateUi(isUnlocked, dictionary);
      } catch (error) {
        const message =
          error?.message === "SUPABASE_NOT_CONFIGURED"
            ? dictionary.toastSupabaseMissing
            : dictionary.toastDailyError;
        if (error?.code === "MINT_REQUIRED") {
          showToast(dictionary.toastDailyLocked);
          return;
        }
        showToast(message);
      }
    });
  });

  qsa("[data-daily-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = qs("[data-daily-text]")?.value;
      if (!text) return;
      await navigator.clipboard.writeText(text);
      showToast(dictionary.toastDailyCopied);
    });
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    updateUi(isUnlocked, dictionary);
    updateContent(qs("[data-daily-text]")?.value || "", dictionary);
  });

  onEvent("wallet:changed", (state) => {
    walletState = state;
  });
};
