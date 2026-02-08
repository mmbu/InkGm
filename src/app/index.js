import { qsa } from "../shared/lib/dom.js";
import { getStoredLanguage, setLanguage } from "./i18n.js";
import { initWallet } from "../features/wallet/index.js";
import { initGm } from "../features/gm/gm.js";
import { initMint } from "../features/mint/mint.js";
import { initDaily } from "../features/daily/daily.js";

const initLanguage = () => {
  const buttons = qsa(".lang-toggle");
  const applyActive = (lang) => {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
  };

  const current = getStoredLanguage();
  setLanguage(current);
  applyActive(current);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang;
      setLanguage(lang);
      applyActive(lang);
    });
  });
};

const initApp = async () => {
  initLanguage();
  initGm();
  initMint();
  initDaily();
  await initWallet();
};

initApp();
