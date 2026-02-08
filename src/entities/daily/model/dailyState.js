import { storage } from "../../../shared/lib/storage.js";
import { todayKey } from "../../../shared/lib/date.js";

const normalizeWallet = (wallet) => wallet?.toLowerCase() || "guest";

export const getDailyDoneKey = (wallet, day = todayKey()) =>
  `daily:done:${normalizeWallet(wallet)}:${day}`;

export const getDailyTextKey = (wallet, day = todayKey()) =>
  `daily:text:${normalizeWallet(wallet)}:${day}`;

export const isDailyDone = (wallet) =>
  storage.get(getDailyDoneKey(wallet), false);

export const setDailyDone = (wallet, done) =>
  storage.set(getDailyDoneKey(wallet), done);

export const getDailyText = (wallet) =>
  storage.get(getDailyTextKey(wallet), "");

export const setDailyText = (wallet, text) =>
  storage.set(getDailyTextKey(wallet), text);
