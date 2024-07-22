import React from "react";

export const DarkModeContext = React.createContext({
  isDarkMode: true,
  setIsDarkMode: (v: boolean) => {},
});
