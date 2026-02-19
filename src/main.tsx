import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { getEstablishment } from "@/lib/store";

const theme = getEstablishment().theme || "verde";
document.documentElement.dataset.theme = theme;


createRoot(document.getElementById("root")!).render(<App />);
