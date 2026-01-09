import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QuranProvider } from "@/context/QuranContext";

createRoot(document.getElementById("root")!).render(
  <QuranProvider>
    <App />
  </QuranProvider>
);

