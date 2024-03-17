import { SignIn } from "@clerk/remix"
import { $path } from "remix-routes"

export default function SignInRoute() {
	return <SignIn path={$path("/sign-in")} />
}
