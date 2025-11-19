import './theme-preload';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoute from "./routes/AppRoute";
import {
  AuthProvider,
  ThemeProvider,
  AlertProvider,
  StompProvider
} from "./provider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AlertProvider>
      <ThemeProvider>
        <AuthProvider>
          <StompProvider>
            <AppRoute />
          </StompProvider>
        </AuthProvider>
      </ThemeProvider>
    </AlertProvider>
  </StrictMode>
);
