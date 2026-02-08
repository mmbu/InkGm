import { onEvent } from "../../../shared/lib/events.js";
import { qs } from "../../../shared/lib/dom.js";
import { connectWallet, isInkNetwork, switchToInk } from "../model/walletModel.js";
import { getDictionary, getStoredLanguage } from "../../../app/i18n.js";

const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";

const updateNetworkPill = (pill, chainId) => {
  if (!chainId) {
    pill.textContent = "Ink L2: —";
    return;
  }
  pill.textContent = isInkNetwork(chainId) ? "Ink L2: Connected" : "Ink L2: Switch";
};

export const initWalletView = () => {
  const connectButton = qs("[data-wallet-connect]");
  const networkPill = qs("[data-network-status]");
  const walletShort = qs("[data-wallet-short]");
  let dictionary = getDictionary(getStoredLanguage());
  let currentState = { connected: false, address: null, chainId: null };

  if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
  }
  if (networkPill) {
    networkPill.style.cursor = "pointer";
    networkPill.addEventListener("click", switchToInk);
  }

  onEvent("wallet:changed", (state) => {
    currentState = state;
    if (connectButton) {
      connectButton.textContent = state.connected
        ? dictionary.walletConnected
        : dictionary.connectWallet;
    }
    if (walletShort) {
      walletShort.textContent = shortAddress(state.address);
    }
    if (networkPill) {
      updateNetworkPill(networkPill, state.chainId);
    }
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    if (connectButton) {
      connectButton.textContent = currentState.connected
        ? dictionary.walletConnected
        : dictionary.connectWallet;
    }
  });
};
