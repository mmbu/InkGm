import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";

const getMessage = (wallet, nonce) =>
  `Ink GM Daily\nWallet: ${wallet}\nNonce: ${nonce}`;

export const requestSignature = async (wallet, nonce) => {
  const dictionary = getDictionary(getStoredLanguage());
  if (!window.ethereum) {
    showToast(dictionary.toastWalletNotFound);
    throw new Error("NO_WALLET");
  }
  try {
    return await window.ethereum.request({
      method: "personal_sign",
      params: [getMessage(wallet, nonce), wallet],
    });
  } catch {
    showToast(dictionary.toastSignatureRejected);
    throw new Error("SIGNATURE_REJECTED");
  }
};
