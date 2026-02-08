import { initWalletModel } from "./model/walletModel.js";
import { initWalletView } from "./ui/walletView.js";

export const initWallet = async () => {
  initWalletView();
  await initWalletModel();
};
