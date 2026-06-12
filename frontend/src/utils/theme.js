const THEME_KEY = "site-theme";

export const getInitialTheme = () => "dark";

export const applyTheme = () => {
  document.documentElement.dataset.theme = "dark";
  localStorage.removeItem(THEME_KEY);
  return "dark";
};

export const initTheme = () => {
  applyTheme();
};
