import { LucideDices } from "lucide-react"
import { AppLogo } from "../ui/app-logo.tsx"
import { ButtonNavLink } from "../ui/button-nav-link.tsx"
import { Heading } from "../ui/heading.tsx"

export default function Landing() {
	return (
		<main className="absolute inset-0 flex flex-col">
			<div className="m-auto flex flex-col items-center justify-center gap-3">
				<Heading className="text-5xl">
					<AppLogo />
				</Heading>
				<p>A virtual tabletop for the Aspects of Nature TTRPG.</p>
				<ButtonNavLink to="/play" icon={<LucideDices />}>
					Play now
				</ButtonNavLink>
			</div>
		</main>
	)
}
