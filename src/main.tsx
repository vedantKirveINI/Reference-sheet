import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./i18n";
import App from "./App";
import { AiEnrichmentPage } from "./views/ai-enrichment/ai-enrichment-page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ai-enrichment" element={<AiEnrichmentPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
