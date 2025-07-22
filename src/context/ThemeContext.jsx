import { useContext } from "react";
import { ThemeContext } from "../provider/ThemeProvider";

export const useTheme = () => {
  return useContext(ThemeContext);
};
