import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/remix"
import { Link, useHref, useLocation } from "@remix-run/react"
import { LucideLogIn } from "lucide-react"
import { $path } from "remix-routes"
import { Button } from "./Button.tsx"

export function AppHeader({
	center,
	end,
}: {
	center?: React.ReactNode
	end?: React.ReactNode
}) {
	const currentUrl = useHref(useLocation())
	return (
		<header className="flex h-10 items-center gap-3">
			<div className="flex flex-1">
				<Link to={$path("/")}>
					<h1 className="text-2xl">
						<span className="font-light text-primary-600">Aspects</span>
						<span className="font-medium text-primary-800">VTT</span>
					</h1>
				</Link>
			</div>
			{center}
			<div className="flex flex-1 justify-end gap-2">
				{end !== undefined ?
					end
				:	<>
						<SignedIn>
							<UserButton afterSignOutUrl={currentUrl} />
						</SignedIn>
						<SignedOut>
							<SignInButton mode="modal" forceRedirectUrl={currentUrl}>
								<Button icon={<LucideLogIn />} text="Sign in" />
							</SignInButton>
						</SignedOut>
					</>
				}
			</div>
		</header>
	)
}
