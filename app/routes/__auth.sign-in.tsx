import { SignIn } from "@clerk/remix"
import { $path } from "remix-routes"

export default function SignInRoute() {
	return <SignIn signUpUrl={$path("/sign-up")} redirectUrl="/" />
}
