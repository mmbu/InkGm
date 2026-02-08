import { storage } from "../../../shared/lib/storage.js";
import { todayKey } from "../../../shared/lib/date.js";

export const getGmStorageKey = (address) => `gm:${address || "guest"}`;

export const getGmState = (address) =>
  storage.get(getGmStorageKey(address), { lastDate: null, count: 0 });

export const setGmState = (address, state) =>
  storage.set(getGmStorageKey(address), state);

export const isGmToday = (state) => state.lastDate === todayKey();

export const markGm = (state) => ({
  lastDate: todayKey(),
  count: state.count + 1,
});
