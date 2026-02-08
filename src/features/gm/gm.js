import { onEvent } from "../../shared/lib/events.js";
import { qsa, qs } from "../../shared/lib/dom.js";
import { storage } from "../../shared/lib/storage.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";

const today = () => new Date().toISOString().slice(0, 10);

const getKey = (address) => `gm:${address || "guest"}`;

const loadState = (key) =>
  storage.get(key, { lastDate: null, count: 0 });

const saveState = (key, state) => storage.set(key, state);

const updateUi = (state, dictionary) => {
  const status = qs("[data-gm-status]");
  const count = qsa("[data-gm-count]");
  if (status) {
    status.textContent =
      state.lastDate === today()
        ? dictionary.gmStatusChecked
        : dictionary.gmStatusNotYet;
  }
  count.forEach((node) => {
    node.textContent = String(state.count);
  });
};

export const initGm = () => {
  let currentKey = getKey(null);
  let currentState = loadState(currentKey);
  let dictionary = getDictionary(getStoredLanguage());

  const handleClick = () => {
    if (currentState.lastDate === today()) {
      showToast(dictionary.toastGmAlready);
      return;
    }
    currentState = {
      lastDate: today(),
      count: currentState.count + 1,
    };
    saveState(currentKey, currentState);
    updateUi(currentState, dictionary);
    showToast(dictionary.toastGmRecorded);
  };

  qsa("[data-gm-action]").forEach((button) => {
    button.addEventListener("click", handleClick);
  });

  onEvent("wallet:changed", (state) => {
    currentKey = getKey(state.address);
    currentState = loadState(currentKey);
    updateUi(currentState, dictionary);
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    updateUi(currentState, dictionary);
  });

  updateUi(currentState, dictionary);
};
