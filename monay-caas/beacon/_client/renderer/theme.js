document.documentElement.dataset.mode = (() => {
  const persistentTheme = window.localStorage.getItem("theme");
  if (persistentTheme === "dark" || persistentTheme === "light") {
    return persistentTheme;
  }
  const mqTheme = window.matchMedia("(prefers-color-scheme: dark)");
  return mqTheme.matches ? "dark" : "light";
})();
