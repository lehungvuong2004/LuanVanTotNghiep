import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./redux/store";
import { Provider } from "react-redux";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "950867093121-s7fm3rjmkk3abn5n7ai2bt6v3mnha33p.apps.googleusercontent.com";
// console.log("mã tui là : ", clientId);
// console.log("url api là : ", import.meta.env.VITE_GOOGLE_CLIENT_ID);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
);
