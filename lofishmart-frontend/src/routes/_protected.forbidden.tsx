import { createFileRoute } from "@tanstack/react-router";
import { Forbidden } from "@/components/Forbidden";

export const Route = createFileRoute("/_protected/forbidden")({
	component: Forbidden,
});
