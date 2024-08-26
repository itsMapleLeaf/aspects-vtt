import { ProtectedLayout } from "../components/ProtectedLayout.tsx"
import { SignInButton } from "../components/SignInButton.tsx"
import { AppLogo } from "../ui/app-logo.tsx"
import { HeaderLayout } from "../ui/header-layout.tsx"
import { Heading } from "../ui/heading.tsx"
import { RoomList } from "../components/RoomList.tsx"

export default function IndexRoute() {
	return (
		<ProtectedLayout fallback={<Landing />}>
			<HeaderLayout>
				<RoomList />
			</HeaderLayout>
		</ProtectedLayout>
	)
}

function Landing() {
	return (
		<main className="absolute inset-0 flex h-screen flex-col">
			<div className="m-auto flex flex-col items-center justify-center gap-3">
				<Heading className="text-5xl">
					<AppLogo />
				</Heading>
				<p>A virtual tabletop for the Aspects of Nature TTRPG.</p>
				<SignInButton />
			</div>
		</main>
	)
}
