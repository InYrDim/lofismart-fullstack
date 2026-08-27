import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_guest/")({
	component: LoginPage,
});
import { Lock, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/cards/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.service";
import { ROLES } from "@/config/roles";
import { getRoleId, checkRoleAny } from "@/hooks/useRoleAndPermission";
import { Modal } from "@/components/ui/modals/Modal";
import BrandLogo from "@/components/brand/BrandLogo";

function LoginPage() {
	const navigate = Route.useNavigate();
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			username: "",
			password: "",
		},

		onSubmit: async ({ value }) => {
			try {
				const user = await AuthService.login(value.username, value.password);
				const roleId = getRoleId(user);
				if (checkRoleAny(roleId, ROLES.ADMIN, ROLES.MANAGER)) {
					navigate({ to: "/dashboard" });
				} else {
					navigate({ to: "/pos" });
				}
			} catch {
				setIsErrorModalOpen(true);
			}
		},
	});

	return (
		<div className="min-h-screen bg-bg-canvas flex items-center justify-center p-4 font-display">
			<Card className="max-w-md w-full shadow-xl">
				<CardHeader className="text-center pb-2">
					<div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
							<BrandLogo />
						</div>
					</div>
					<h1 className="text-2xl font-bold text-brand-tertiary">
						LoFISH MART
					</h1>
					<p className="text-text-secondary mt-2">
						Masuk untuk mengakses kasir
					</p>
				</CardHeader>

				<CardContent className="p-8 pt-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<form.Field
							name="username"
							validators={{
								onChange: z.string().min(1, "Username harus diisi"),
							}}
							children={(field) => (
								<Input
									label="Username"
									leftIcon={User}
									type="text"
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Masukkan username"
									error={
										field.state.meta.errors
											? field.state.meta.errors
												.map((e) => (e as any)?.message || e)
												.join(", ")
											: undefined
									}
									fullWidth
									autoComplete="username"
								/>
							)}
						/>

						<form.Field
							name="password"
							validators={{
								onChange: z.string().min(1, "Password harus diisi"),
							}}
							children={(field) => (
								<Input
									label="Password"
									leftIcon={Lock}
									type="password"
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Masukkan password"
									error={
										field.state.meta.errors
											? field.state.meta.errors
												.map((e) => (e as any)?.message || e)
												.join(", ")
											: undefined
									}
									fullWidth
									autoComplete="current-password"
								/>
							)}
						/>

						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit}
									isLoading={isSubmitting}
									fullWidth
									className="shadow-lg shadow-brand-primary/20"
								>
									Masuk Sekarang
								</Button>
							)}
						/>
					</form>
				</CardContent>
			</Card>
			<Modal
				isOpen={isErrorModalOpen}
				onClose={() => setIsErrorModalOpen(false)}
				title="Login Gagal"
				description="Username atau password yang Anda masukkan salah. Silakan periksa kembali."
				variant="error"
				layout="center"
			>
				<div className="flex flex-col items-center text-center px-6 pb-8">
					<Button
						onClick={() => setIsErrorModalOpen(false)}
						className="w-full py-6 rounded-xl shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white mt-4"
					>
						Tutup
					</Button>
				</div>
			</Modal>
		</div>
	);
}
