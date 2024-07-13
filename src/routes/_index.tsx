import { LucideDices } from "lucide-react"
import { ButtonNavLink } from "../ui/button-nav-link.tsx"
import { Heading } from "../ui/heading.tsx"

export default function Landing() {
	return (
		<main className="margin-center flex h-screen w-screen flex-col gap-3">
			<Heading className="text-5xl">
				<span className="text-base-300">Aspects</span>
				<span className="font-medium text-accent-500">VTT</span>
			</Heading>
			<p>A virtual tabletop for the Aspects of Nature TTRPG.</p>
			<ButtonNavLink to="/play/create" icon={<LucideDices />}>
				Play now
			</ButtonNavLink>
		</main>
	)
}
