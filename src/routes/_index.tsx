import { LucideDices } from "lucide-react"
import { ButtonNavLink } from "../ui/button-nav-link.tsx"
import { Heading } from "../ui/heading.tsx"

export default function Landing() {
	return (
		<main className="flex h-screen w-screen flex-col gap-3 *:mx-auto first:*:mt-auto last:*:mb-auto">
			<Heading className="text-5xl">
				<span className="text-base-300">Aspects</span>
				<span className="text-accent-500 font-medium">VTT</span>
			</Heading>
			<p>A virtual tabletop for the Aspects of Nature TTRPG.</p>
			<ButtonNavLink to="/play/create" icon={<LucideDices />}>
				Play now
			</ButtonNavLink>
		</main>
	)
}
