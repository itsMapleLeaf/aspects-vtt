import { SignUp } from "@clerk/remix"
import { $path } from "remix-routes"

export default function SignUpRoute() {
	return <SignUp signInUrl={$path("/sign-in")} />
}
