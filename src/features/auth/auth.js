import { showToast } from "../../shared/ui/toast.js";
import { getDictionary, getStoredLanguage } from "../../app/i18n.js";
import { getActiveProvider } from "../wallet/model/walletModel.js";

const getMessage = (wallet, nonce) =>
  `Ink GM Daily\nWallet: ${wallet}\nNonce: ${nonce}`;

export const requestSignature = async (wallet, nonce) => {
  const dictionary = getDictionary(getStoredLanguage());
  const provider = getActiveProvider();
  if (!provider) {
    showToast(dictionary.toastWalletNotFound);
    throw new Error("NO_WALLET");
  }
  try {
    return await provider.request({
      method: "personal_sign",
      params: [getMessage(wallet, nonce), wallet],
    });
  } catch {
    showToast(dictionary.toastSignatureRejected);
    throw new Error("SIGNATURE_REJECTED");
  }
};
