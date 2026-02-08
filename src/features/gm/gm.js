import { onEvent, emitEvent } from "../../shared/lib/events.js";
import { qsa, qs } from "../../shared/lib/dom.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import {
  getGmState,
  isGmToday,
  markGm,
  setGmState,
} from "../../entities/gm/model/gmState.js";

const updateUi = (state, dictionary) => {
  const status = qs("[data-gm-status]");
  const count = qsa("[data-gm-count]");
  const isToday = isGmToday(state);
  if (status) {
    status.textContent = isToday
      ? dictionary.gmStatusChecked
      : dictionary.gmStatusNotYet;
  }
  qsa("[data-gm-action]").forEach((button) => {
    button.disabled = isToday;
  });
  count.forEach((node) => {
    node.textContent = String(state.count);
  });
};

export const initGm = () => {
  let currentAddress = null;
  let currentState = getGmState(currentAddress);
  let dictionary = getDictionary(getStoredLanguage());

  const handleClick = () => {
    if (isGmToday(currentState)) {
      showToast(dictionary.toastGmAlready);
      return;
    }
    currentState = markGm(currentState);
    setGmState(currentAddress, currentState);
    updateUi(currentState, dictionary);
    showToast(dictionary.toastGmRecorded);
    emitEvent("gm:changed", { address: currentAddress, state: currentState });
  };

  qsa("[data-gm-action]").forEach((button) => {
    button.addEventListener("click", handleClick);
  });

  onEvent("wallet:changed", (state) => {
    currentAddress = state.address || null;
    currentState = getGmState(currentAddress);
    updateUi(currentState, dictionary);
    emitEvent("gm:changed", { address: currentAddress, state: currentState });
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    updateUi(currentState, dictionary);
  });

  updateUi(currentState, dictionary);
  emitEvent("gm:changed", { address: currentAddress, state: currentState });
};
