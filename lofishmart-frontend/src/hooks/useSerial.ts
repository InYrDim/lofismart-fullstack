import { useContext } from "react";
import { SerialContext } from "@/context/SerialContext";

export const useSerial = () => {
	const context = useContext(SerialContext);
	if (!context) {
		throw new Error("useSerial must be used within a SerialProvider");
	}
	return context;
};
