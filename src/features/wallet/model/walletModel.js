import { emitEvent } from "../../../shared/lib/events.js";
import { INK_NETWORK } from "../../../shared/config/network.js";
import { showToast } from "../../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../../app/i18n.js";

const state = {
  address: null,
  chainId: null,
  connected: false,
};

let activeProvider = null;

const hasProvider = () => typeof window.ethereum !== "undefined";

const pickProvider = (providers) => {
  if (!providers || providers.length === 0) return null;
  return (
    providers.find((provider) => provider.isRabby) ||
    providers.find((provider) => provider.isMetaMask) ||
    providers[0]
  );
};

const getInjectedProvider = () => {
  if (!hasProvider()) return null;
  if (Array.isArray(window.ethereum.providers)) {
    return pickProvider(window.ethereum.providers);
  }
  return window.ethereum;
};

const ensureProvider = () => {
  if (!activeProvider) {
    activeProvider = getInjectedProvider();
  }
  return activeProvider;
};

const updateState = (nextState) => {
  Object.assign(state, nextState);
  emitEvent("wallet:changed", { ...state });
};

const syncChain = async () => {
  const provider = ensureProvider();
  if (!provider) return;
  const chainId = await provider.request({ method: "eth_chainId" });
  updateState({ chainId });
};

export const isInkNetwork = (chainId) =>
  (chainId || "").toLowerCase() === INK_NETWORK.chainId.toLowerCase();

export const connectWallet = async () => {
  const dictionary = getDictionary(getStoredLanguage());
  const provider = ensureProvider();
  if (!provider) {
    showToast(dictionary.toastWalletNotFound);
    return;
  }
  try {
    const accounts = await provider.request({
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
  const provider = ensureProvider();
  if (!provider) {
    showToast(dictionary.toastWalletNotFound);
    return;
  }
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: INK_NETWORK.chainId }],
    });
    await syncChain();
    showToast(dictionary.toastSwitchInk);
  } catch (error) {
    if (error?.code === 4902) {
      try {
        await provider.request({
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

export const getActiveProvider = () => ensureProvider();

export const initWalletModel = async () => {
  const provider = ensureProvider();
  if (!provider) return;
  provider.on("accountsChanged", (accounts) => {
    updateState({
      address: accounts[0] || null,
      connected: accounts.length > 0,
    });
  });
  provider.on("chainChanged", (chainId) => {
    updateState({ chainId });
  });

  const accounts = await provider.request({
    method: "eth_accounts",
  });
  updateState({
    address: accounts[0] || null,
    connected: accounts.length > 0,
  });
  await syncChain();
};
