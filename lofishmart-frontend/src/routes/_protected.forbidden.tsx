import { createFileRoute } from "@tanstack/react-router";
import { Forbidden } from "@/components/Forbidden";

export const Route = createFileRoute("/_protected/forbidden")({
	component: ForbiddenRoute,
});

function ForbiddenRoute() {
	// Alasan pilihan (opsional) diteruskan lewat query string agar halaman
	// forbibden bisa menampilkan penjelasan yang spesifik.
	const { reason } = Route.useSearch() as { reason?: string };
	return <Forbidden reason={reason} />;
}
