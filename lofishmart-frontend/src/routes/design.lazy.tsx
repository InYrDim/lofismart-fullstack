import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/cards/Card";
import { Modal, ModalFooter } from "@/components/ui/modals/Modal";
import { Search, Mail, AlertCircle, CheckCircle } from "lucide-react";

export const Route = createLazyFileRoute("/design")({
	component: DesignShowcasePage,
});

function DesignShowcasePage() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className="min-h-screen bg-bg-canvas p-8 font-sans space-y-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-text-primary mb-2">
					Design System Showcase
				</h1>
				<p className="text-text-secondary">
					Reusable components demonstration.
				</p>
			</header>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Buttons</h2>
				<div className="flex flex-wrap gap-4 items-center">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="danger">Danger</Button>
					<Button variant="primary" size="sm">
						Small
					</Button>
					<Button variant="primary" size="lg">
						Large
					</Button>
					<Button isLoading>Loading</Button>
					<Button disabled>Disabled</Button>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Badges</h2>
				<div className="flex flex-wrap gap-4">
					<Badge variant="default">Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge size="md">Medium Size</Badge>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Inputs & Selects</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
					<Input placeholder="Default input" />
					<Input label="With Label" placeholder="Enter text..." />
					<Select
						label="Custom Select"
						placeholder="Choose style..."
						options={[
							{ value: "modern", label: "Modern Style" },
							{ value: "classic", label: "Classic Style" },
							{ value: "minimal", label: "Minimalist" },
						]}
						// Simple console log for demo; in real app use state
						onChange={(val) => console.log(val)}
					/>
					<Select
						label="With Error"
						error="Selection required"
						options={[{ value: "1", label: "Invalid Option" }]}
					/>
					<Input label="With Icon" placeholder="Search..." leftIcon={Search} />
					<Input
						label="With Error"
						placeholder="Error state"
						error="This field is required"
						rightIcon={AlertCircle}
					/>
					<Input
						label="With Helper Text"
						placeholder="Email address"
						helperText="We'll never share your email."
						leftIcon={Mail}
					/>
					<Input label="Disabled" placeholder="Cannot type here" disabled />
					<Input
						label="With Left Addon"
						placeholder="Amount"
						leftAddon={
							<span className="text-sm font-bold text-gray-500">Rp</span>
						}
						inputClassName="font-mono"
					/>
					<Input
						label="With Right Addon"
						placeholder="Weight"
						rightAddon={
							<span className="text-xs font-bold text-gray-500">KG</span>
						}
					/>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Cards</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
					<Card>
						<CardHeader>
							<CardTitle>Card Title</CardTitle>
							<CardDescription>Card description goes here.</CardDescription>
						</CardHeader>
						<CardContent>
							<p>This is the main content of the card.</p>
						</CardContent>
						<CardFooter>
							<Button variant="outline" size="sm">
								Action
							</Button>
						</CardFooter>
					</Card>

					<Card className="bg-brand-primary text-text-on-brand border-none">
						<CardHeader>
							<CardTitle className="text-white">Primary Card</CardTitle>
							<CardDescription className="text-blue-100">
								Colored card variant
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Content on a colored background.</p>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Tooltips</h2>
				<div className="flex flex-wrap gap-8 items-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
					<Tooltip content="Tooltip on top" position="top">
						<Button variant="outline" size="sm">
							Hover Top
						</Button>
					</Tooltip>
					<Tooltip content="Tooltip on bottom" position="bottom">
						<Button variant="outline" size="sm">
							Hover Bottom
						</Button>
					</Tooltip>
					<Tooltip content="Tooltip on left" position="left">
						<Button variant="outline" size="sm">
							Hover Left
						</Button>
					</Tooltip>
					<Tooltip content="Tooltip on right" position="right">
						<Button variant="outline" size="sm">
							Hover Right
						</Button>
					</Tooltip>
					<div className="flex gap-2">
						<Tooltip content="Success badge info">
							<Badge variant="success">Success Badge</Badge>
						</Tooltip>
						<Tooltip content="Destructive badge info">
							<Badge variant="destructive">Info</Badge>
						</Tooltip>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">Modals</h2>
				<div className="flex gap-4">
					<Button onClick={() => setIsModalOpen(true)}>
						Open Default Modal
					</Button>
				</div>
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					title="Example Modal"
					description="This is a reusable modal component."
					size="lg"
				>
					<div className="space-y-4">
						<p className="text-text-secondary">
							You can put any content here. It handles backdrop clicks and
							Escape key automatically.
						</p>
						<div className="p-4 bg-bg-neutral rounded-lg flex items-center gap-3">
							<CheckCircle className="text-green-600 h-5 w-5" />
							<span className="text-sm font-medium">Action successful!</span>
						</div>
						<div className="p-4 border border-dashed border-gray-300 rounded-lg">
							<p className="text-xs text-gray-400">
								Supports Custom Styling: className="max-w-5xl"
								contentClassName="p-0"
							</p>
						</div>
					</div>
					<ModalFooter>
						<Button variant="secondary" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
					</ModalFooter>
				</Modal>
			</section>
		</div>
	);
}
