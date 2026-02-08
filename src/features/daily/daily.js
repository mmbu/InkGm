import { qsa, qs } from "../../shared/lib/dom.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import { onEvent } from "../../shared/lib/events.js";
import { getWalletState } from "../wallet/model/walletModel.js";
import {
  issueNonce,
  fetchDailyPost,
  fetchStats,
} from "../../entities/daily/api/dailyApi.js";
import { requestSignature } from "../auth/auth.js";
import {
  getDailyText,
  isDailyDone,
  setDailyDone,
  setDailyText,
} from "../../entities/daily/model/dailyState.js";
import {
  getGmState,
  isGmToday,
} from "../../entities/gm/model/gmState.js";

const updateUi = ({ hasWallet, hasGmToday, doneToday }, dictionary) => {
  const badge = qs("[data-daily-status]");
  const buttons = qsa("[data-daily-action]");
  if (badge) {
    if (!hasWallet) {
      badge.textContent = dictionary.dailyStatusConnect;
    } else if (!hasGmToday) {
      badge.textContent = dictionary.dailyStatusGmRequired;
    } else if (doneToday) {
      badge.textContent = dictionary.dailyStatusDone;
    } else {
      badge.textContent = dictionary.dailyStatusReady;
    }
  }
  const isDisabled = !hasWallet || !hasGmToday || doneToday;
  buttons.forEach((button) => {
    button.disabled = isDisabled;
  });
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

const updateTotalPosts = (total) => {
  const node = qs("[data-daily-total]");
  if (node) {
    node.textContent = String(total ?? 0);
  }
};

export const initDaily = () => {
  let dictionary = getDictionary(getStoredLanguage());
  let walletState = getWalletState();
  let gmState = getGmState(walletState.address);

  const refresh = () => {
    const hasWallet = Boolean(walletState.address);
    const hasGmToday = hasWallet && isGmToday(gmState);
    const doneToday = hasWallet && isDailyDone(walletState.address);
    updateUi({ hasWallet, hasGmToday, doneToday }, dictionary);
    const cachedText = hasWallet ? getDailyText(walletState.address) : "";
    updateContent(cachedText, dictionary);
  };

  refresh();
  fetchStats()
    .then((data) => updateTotalPosts(data.totalPosts))
    .catch(() => updateTotalPosts(0));

  qsa("[data-daily-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!walletState.connected || !walletState.address) {
        showToast(dictionary.toastConnectToMint);
        return;
      }
      if (!isGmToday(gmState)) {
        showToast(dictionary.toastGmRequired);
        return;
      }
      if (isDailyDone(walletState.address)) {
        showToast(dictionary.toastDailyUsed);
        refresh();
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
        setDailyText(walletState.address, dailyResponse.post.text);
        updateContent(dailyResponse.post.text, dictionary);
        showToast(dictionary.toastDailyOpen);
        refresh();
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

  qsa("[data-daily-share]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!walletState.address) return;
      setDailyDone(walletState.address, true);
      refresh();
    });
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    refresh();
  });

  onEvent("wallet:changed", (state) => {
    walletState = state;
    gmState = getGmState(walletState.address);
    refresh();
  });

  onEvent("gm:changed", ({ state }) => {
    gmState = state;
    refresh();
  });
};
