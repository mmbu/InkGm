import { onEvent, emitEvent } from "../../shared/lib/events.js";
import { qsa, qs } from "../../shared/lib/dom.js";
import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import {
  getGmState,
  isGmToday,
  markGm,
  setGmState,
  mergeChainState,
} from "../../entities/gm/model/gmState.js";
import { GM_CONTRACT, isGmContractConfigured } from "../../shared/config/gmContract.js";
import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";
import { getActiveProvider, getWalletState } from "../wallet/model/walletModel.js";

const updateUi = (state, dictionary, hasWallet) => {
  const status = qs("[data-gm-status]");
  const total = qs("[data-gm-total]");
  const isToday = hasWallet && isGmToday(state);
  if (status) {
    status.textContent = !hasWallet
      ? dictionary.gmStatusConnect
      : isToday
        ? dictionary.gmStatusChecked
        : dictionary.gmStatusNotYet;
  }
  qsa("[data-gm-action]").forEach((button) => {
    button.disabled = isToday;
  });
  if (total) {
    total.textContent = state.total || "0";
  }
};

const getContract = async () => {
  const injected = getActiveProvider();
  if (!injected) return null;
  const provider = new BrowserProvider(injected);
  const signer = await provider.getSigner();
  return new Contract(GM_CONTRACT.address, GM_CONTRACT.abi, signer);
};

const refreshChainState = async (address, currentState) => {
  if (!isGmContractConfigured() || !address) return currentState;
  try {
    const injected = getActiveProvider();
    if (!injected) return currentState;
    const provider = new BrowserProvider(injected);
    const contract = new Contract(GM_CONTRACT.address, GM_CONTRACT.abi, provider);
    const [totalGm, lastDay] = await Promise.all([
      contract.totalGm(),
      contract.lastGmDay(address),
    ]);
    return mergeChainState(
      { ...currentState, total: totalGm.toString() },
      Number(lastDay)
    );
  } catch {
    return currentState;
  }
};

export const initGm = () => {
  let currentAddress = null;
  let currentState = getGmState(currentAddress);
  let walletState = getWalletState();
  let dictionary = getDictionary(getStoredLanguage());

  const handleClick = async () => {
    if (!walletState.address) {
      showToast(dictionary.toastGmConnect);
      return;
    }
    if (!isGmContractConfigured()) {
      showToast(dictionary.toastGmNotConfigured);
      return;
    }
    if (isGmToday(currentState)) {
      showToast(dictionary.toastGmAlready);
      return;
    }
    try {
      const contract = await getContract();
      if (!contract) {
        showToast(dictionary.toastWalletNotFound);
        return;
      }
      const tx = await contract.gm();
      await tx.wait();
      currentState = markGm(currentState);
      currentState = await refreshChainState(currentAddress, currentState);
      setGmState(currentAddress, currentState);
      updateUi(currentState, dictionary, Boolean(walletState.address));
      showToast(dictionary.toastGmRecorded);
      emitEvent("gm:changed", { address: currentAddress, state: currentState });
    } catch {
      showToast(dictionary.toastGmFailed);
    }
  };

  qsa("[data-gm-action]").forEach((button) => {
    button.addEventListener("click", handleClick);
  });

  onEvent("wallet:changed", (state) => {
    walletState = state;
    currentAddress = state.address || null;
    currentState = getGmState(currentAddress);
    refreshChainState(currentAddress, currentState).then((nextState) => {
      currentState = nextState;
      setGmState(currentAddress, currentState);
      updateUi(currentState, dictionary, Boolean(walletState.address));
      emitEvent("gm:changed", { address: currentAddress, state: currentState });
    });
  });

  onEvent("lang:changed", ({ dict }) => {
    dictionary = dict;
    updateUi(currentState, dictionary, Boolean(walletState.address));
  });

  refreshChainState(currentAddress, currentState).then((nextState) => {
    currentState = nextState;
    updateUi(currentState, dictionary, Boolean(walletState.address));
    emitEvent("gm:changed", { address: currentAddress, state: currentState });
  });
};
