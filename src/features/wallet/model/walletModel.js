import { emitEvent } from "../../../shared/lib/events.js";
import { INK_NETWORK } from "../../../shared/config/network.js";
import { showToast } from "../../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../../app/i18n.js";

const state = {
  address: null,
  chainId: null,
  connected: false,
};

const hasProvider = () => typeof window.ethereum !== "undefined";

const updateState = (nextState) => {
  Object.assign(state, nextState);
  emitEvent("wallet:changed", { ...state });
};

const syncChain = async () => {
  if (!hasProvider()) return;
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  updateState({ chainId });
};

export const isInkNetwork = (chainId) =>
  (chainId || "").toLowerCase() === INK_NETWORK.chainId.toLowerCase();

export const connectWallet = async () => {
  const dictionary = getDictionary(getStoredLanguage());
  if (!hasProvider()) {
    showToast(dictionary.toastWalletNotFound);
    return;
  }
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateState({
      address: accounts[0] || null,
      connected: accounts.length > 0,
    });
    await syncChain();
    showToast(dictionary.toastWalletConnected);
  } catch (error) {
    showToast(dictionary.toastWalletRejected);
  }
};

export const switchToInk = async () => {
  const dictionary = getDictionary(getStoredLanguage());
  if (!hasProvider()) {
    showToast(dictionary.toastWalletNotFound);
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: INK_NETWORK.chainId }],
    });
    await syncChain();
    showToast(dictionary.toastSwitchInk);
  } catch (error) {
    if (error?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [INK_NETWORK],
        });
        await syncChain();
        showToast(dictionary.toastAddInk);
      } catch {
        showToast(dictionary.toastAddInkFailed);
      }
      return;
    }
    showToast(dictionary.toastSwitchRejected);
  }
};

export const getWalletState = () => ({ ...state });

export const initWalletModel = async () => {
  if (!hasProvider()) return;
  window.ethereum.on("accountsChanged", (accounts) => {
    updateState({
      address: accounts[0] || null,
      connected: accounts.length > 0,
    });
  });
  window.ethereum.on("chainChanged", (chainId) => {
    updateState({ chainId });
  });

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  updateState({
    address: accounts[0] || null,
    connected: accounts.length > 0,
  });
  await syncChain();
};
