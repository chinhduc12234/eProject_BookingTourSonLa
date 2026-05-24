const THEME_KEY = "site-theme";
const THEMES = ["dark", "light"];

export const getInitialTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (THEMES.includes(storedTheme)) {
    return storedTheme;
  }

  return "dark";
};

export const applyTheme = (theme) => {
  const nextTheme = THEMES.includes(theme) ? theme : "dark";

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  window.dispatchEvent(
    new CustomEvent("theme-change", {
      detail: nextTheme,
    }),
  );

  return nextTheme;
};

export const initTheme = () => {
  applyTheme(getInitialTheme());
};
