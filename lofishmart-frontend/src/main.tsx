import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SerialProvider } from "./context/SerialProvider";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SerialProvider>
			<App />
		</SerialProvider>
	</StrictMode>
);
