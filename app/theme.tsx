import React, { useEffect } from "react";

const ThemeChoice = {
  LIGHT: "winter",
  DARK: "night",
} as const;

type Theme = (typeof ThemeChoice)[keyof typeof ThemeChoice];

const prefersDarkMQ = "(prefers-color-scheme: dark)";
const getPreferredTheme = () =>
  window.matchMedia(prefersDarkMQ).matches
    ? ThemeChoice.DARK
    : ThemeChoice.LIGHT;

type ThemeContextType = {
  theme: Theme | undefined;
  setTheme: React.Dispatch<React.SetStateAction<Theme | undefined>>;
  toggleTheme: () => Theme;
};

const ThemeContext = React.createContext<ThemeContextType>(
  {} as ThemeContextType,
);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme | undefined>();

  useEffect(() => {
    setTheme(getPreferredTheme());
  }, []);

  const toggleTheme = () =>
    theme === ThemeChoice.DARK ? ThemeChoice.LIGHT : ThemeChoice.DARK;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeChoice, ThemeProvider, useTheme, ThemeContext };
