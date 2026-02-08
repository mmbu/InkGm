import { qsa, qs } from "../../shared/lib/dom.js";
import { storage } from "../../shared/lib/storage.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import { onEvent } from "../../shared/lib/events.js";

const STORAGE_KEY = "daily:unlocked";

const updateUi = (isUnlocked) => {
  const badge = qs("[data-daily-status]");
  if (badge) {
    badge.textContent = isUnlocked ? "Unlocked" : "Locked";
  }
};

export const initDaily = () => {
  let isUnlocked = storage.get(STORAGE_KEY, false);
  let dictionary = getDictionary(getStoredLanguage());
  updateUi(isUnlocked);

  qsa("[data-daily-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isUnlocked) {
        showToast(dictionary.toastDailyLocked);
        return;
      }
      showToast(dictionary.toastDailyOpen);
    });
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
  });
};
