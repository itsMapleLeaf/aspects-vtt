import { ProtectedLayout } from "../auth/protected-layout.tsx"
import { SignInButton } from "../auth/sign-in-button.tsx"
import { RoomList } from "../rooms/room-list.tsx"
import { AppLogo } from "../ui/app-logo.tsx"
import { HeaderLayout } from "../ui/header-layout.tsx"
import { Heading } from "../ui/heading.tsx"

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
