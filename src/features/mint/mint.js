import { onEvent } from "../../shared/lib/events.js";
import { qsa } from "../../shared/lib/dom.js";
import { showToast } from "../../shared/ui/toast.js";
import { getWalletState, isInkNetwork } from "../wallet/model/walletModel.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";

export const initMint = () => {
  let walletState = getWalletState();
  let dictionary = getDictionary(getStoredLanguage());

  const handleMintClick = () => {
    if (!walletState.connected) {
      showToast(dictionary.toastConnectToMint);
      return;
    }
    if (!isInkNetwork(walletState.chainId)) {
      showToast(dictionary.toastSwitchToMint);
      return;
    }
    showToast(dictionary.toastMintSoon);
  };

  qsa("[data-mint-action]").forEach((button) => {
    button.addEventListener("click", handleMintClick);
  });

  onEvent("wallet:changed", (state) => {
    walletState = state;
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
  });
};
