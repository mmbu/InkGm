import { qsa } from "../shared/lib/dom.js";
import { storage } from "../shared/lib/storage.js";
import { emitEvent } from "../shared/lib/events.js";

const STORAGE_KEY = "lang";

const DICTIONARY = {
  en: {
    heroEyebrow: "Tap to GM on Ink L2",
    heroTitle: "GM. Mint. Share.",
    heroSubtitle:
      "Daily GM check-ins on Ink. Mint the NFT for $5 to unlock Daily reposts.",
    gmTodayLabel: "GM today",
    gmTotalLabel: "Total GM",
    walletLabel: "Wallet",
    gmPanelTitle: "GM Check-in",
    gmPanelText:
      "No NFT needed to say GM. One GM per day per wallet or device.",
    mintPanelTitle: "Ink Mint — $5",
    mintPanelText:
      "Mint the GM NFT on Ink L2. Immutable, ownerless contract. Rewards go to 0x2059...b63F.",
    mintPanelNote: "Minting will be enabled after contract deployment.",
    dailyPanelTitle: "Daily Repost",
    dailyPanelText: "Unlock one-click reposts about Ink. Available after mint.",
    footerDisclaimer: "GM is free. Minting NFT requires Ink L2.",
    gmButton: "GM",
    mintButton: "Mint NFT — $5",
    dailyButton: "Daily Repost",
    dailyOpenButton: "Open Daily",
    connectWallet: "Connect Wallet",
    walletConnected: "Wallet Connected",
    gmStatusChecked: "Checked in",
    gmStatusNotYet: "Not yet",
    toastGmAlready: "GM already recorded today",
    toastGmRecorded: "GM recorded",
    toastWalletNotFound: "Wallet not found",
    toastWalletConnected: "Wallet connected",
    toastWalletRejected: "Wallet connection rejected",
    toastSwitchInk: "Switched to Ink",
    toastAddInk: "Ink network added",
    toastAddInkFailed: "Failed to add Ink network",
    toastSwitchRejected: "Network switch rejected",
    toastConnectToMint: "Connect wallet to mint",
    toastSwitchToMint: "Switch to Ink L2 to mint",
    toastMintSoon: "Minting will be enabled soon",
    toastDailyLocked: "Mint NFT to unlock Daily",
    toastDailyOpen: "Daily reposts will open here",
  },
  ru: {
    heroEyebrow: "Тапни GM в сети Ink L2",
    heroTitle: "GM. Mint. Share.",
    heroSubtitle:
      "Ежедневные GM в Ink. Минт NFT за $5 открывает Daily репосты.",
    gmTodayLabel: "GM сегодня",
    gmTotalLabel: "Всего GM",
    walletLabel: "Кошелек",
    gmPanelTitle: "GM чек-ин",
    gmPanelText:
      "NFT не нужен для GM. Один GM в день на кошелек или устройство.",
    mintPanelTitle: "Ink Mint — $5",
    mintPanelText:
      "Минти GM NFT в Ink L2. Контракт неизменяемый и без владельца. Награды: 0x2059...b63F.",
    mintPanelNote: "Минт будет включен после деплоя контракта.",
    dailyPanelTitle: "Daily репост",
    dailyPanelText:
      "Открой репосты про Ink в один клик. Доступно после минта.",
    footerDisclaimer: "GM бесплатно. Минт NFT требует Ink L2.",
    gmButton: "GM",
    mintButton: "Минт NFT — $5",
    dailyButton: "Daily репост",
    dailyOpenButton: "Открыть Daily",
    connectWallet: "Подключить кошелек",
    walletConnected: "Кошелек подключен",
    gmStatusChecked: "Отмечен",
    gmStatusNotYet: "Еще нет",
    toastGmAlready: "GM уже отмечен сегодня",
    toastGmRecorded: "GM записан",
    toastWalletNotFound: "Кошелек не найден",
    toastWalletConnected: "Кошелек подключен",
    toastWalletRejected: "Подключение отклонено",
    toastSwitchInk: "Переключено на Ink",
    toastAddInk: "Сеть Ink добавлена",
    toastAddInkFailed: "Не удалось добавить Ink",
    toastSwitchRejected: "Переключение сети отклонено",
    toastConnectToMint: "Подключи кошелек для минта",
    toastSwitchToMint: "Переключись на Ink L2 для минта",
    toastMintSoon: "Минт скоро будет доступен",
    toastDailyLocked: "Минт NFT для доступа к Daily",
    toastDailyOpen: "Здесь откроются Daily репосты",
  },
};

export const setLanguage = (lang) => {
  const dict = DICTIONARY[lang] || DICTIONARY.en;
  qsa("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dict[key]) {
      node.textContent = dict[key];
    }
  });
  storage.set(STORAGE_KEY, lang);
  emitEvent("lang:changed", { lang, dict });
};

export const getStoredLanguage = () => storage.get(STORAGE_KEY, "en");

export const getDictionary = (lang) => DICTIONARY[lang] || DICTIONARY.en;
