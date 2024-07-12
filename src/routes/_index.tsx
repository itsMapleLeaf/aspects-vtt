import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { useQuery } from "convex/react"
import { LucideDoorOpen, LucideUserPlus } from "lucide-react"
import { ComponentProps, useState } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../convex/_generated/api.js"
import { Doc } from "../../convex/_generated/dataModel.js"
import { Button } from "../ui/button.tsx"
import { Heading, HeadingLevel } from "../ui/heading.tsx"
import { mergeClassProp } from "../ui/helpers.ts"
import { Column, Row } from "../ui/layout.tsx"
import { Loading } from "../ui/loading.tsx"

export default function Index() {
	const user = useQuery(api.users.me)
	return (
		<>
			{user === undefined ? null : user === null ? (
				<AuthForm />
			) : (
				<WelcomeMessage user={user} />
			)}
			<LoadingCover visible={user === undefined} />
		</>
	)
}

function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"fixed inset-0 z-10 bg-stone-900 opacity-0 flex items-center justify-center transition-all invisible duration-1000",
				visible && "opacity-100 visible",
			)}
		>
			<Loading className="size-24" />
		</div>
	)
}

function WelcomeMessage({ user }: { user: Doc<"users"> }) {
	const auth = useAuthActions()
	return (
		<>
			<p>hi, {user.name}!</p>
			<button
				onClick={() => {
					auth.signOut().catch(console.error)
				}}
			>
				Sign out
			</button>
		</>
	)
}

function AuthForm() {
	const auth = useAuthActions()
	const [flow, setFlow] = useState<"signIn" | "signUp">("signIn")
	const [error, setError] = useState<string>()

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		auth.signIn("password", form).catch((error) => {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		})
	}

	return (
		<main className="flex flex-col py-24 h-screen min-h-fit px-4 items-center justify-center">
			<HeadingLevel>
				<Heading className="text-4xl mb-6 text-center text-balance max-w-80">
					{flow === "signIn" ? "Sign in" : "Create an account"} to continue.
				</Heading>

				<Panel className="p-4 w-[320px]">
					<Column className="items-center">
						<Button
							icon={<SiDiscord />}
							onClick={() => {
								auth.signIn("discord").catch(console.error)
							}}
						>
							Continue with Discord
						</Button>

						<Row className="items-center w-full gap-2">
							<div className="flex-1 h-px bg-stone-700"></div>
							<p className="text-stone-400">or</p>
							<div className="flex-1 h-px bg-stone-700"></div>
						</Row>

						<Heading className="text-xl">
							{flow === "signUp" ? "Register" : "Sign in"} with email
						</Heading>

						<form
							onSubmit={(event) => {
								handleSubmit(event)
							}}
							className="flex flex-col gap-4 w-full"
						>
							<InputField type="email" name="email" label="Email" required />

							{flow === "signUp" && (
								<InputField
									type="text"
									name="name"
									label="Display name"
									required
								/>
							)}

							<InputField
								type="password"
								name="password"
								label="Password"
								required
							/>

							<input type="hidden" name="flow" value={flow} />

							<Button
								type="submit"
								className="self-center"
								icon={
									flow === "signIn" ? <LucideDoorOpen /> : <LucideUserPlus />
								}
							>
								{flow === "signIn" ? "Sign in" : "Create account"}
							</Button>

							{error && <ErrorText>{error}</ErrorText>}
						</form>
					</Column>
				</Panel>

				<p className="text-stone-400 text-center mt-4">
					{flow === "signIn" && (
						<>
							don't have an account?{" "}
							<button
								type="button"
								onClick={() => setFlow("signUp")}
								className="text-stone-200 underline hover:no-underline cursor-pointer"
							>
								register
							</button>
						</>
					)}
					{flow === "signUp" && (
						<>
							already have an account?{" "}
							<button
								type="button"
								onClick={() => setFlow("signIn")}
								className="text-stone-200 underline hover:no-underline cursor-pointer"
							>
								sign in
							</button>
						</>
					)}
				</p>
			</HeadingLevel>
		</main>
	)
}

function Panel(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"bg-stone-900 rounded border border-stone-700 shadow",
				props.className,
			)}
		/>
	)
}

function Field({
	label,
	children,
	...props
}: ComponentProps<"div"> & { label: string }) {
	return (
		<div {...mergeClassProp(props, "flex flex-col gap-1")}>
			<label htmlFor={props.id} className="text-sm font-bold leading-4">
				{label}
			</label>
			{children}
		</div>
	)
}

function Input(props: ComponentProps<"input">) {
	return (
		<input
			{...mergeClassProp(
				props,
				"border border-stone-700 bg-stone-800 rounded p-2 text-stone-300",
			)}
		/>
	)
}

function InputField({
	label,
	...props
}: ComponentProps<"input"> & { label: string }) {
	return (
		<Field label={label}>
			<Input {...mergeClassProp(props, "w-full")} />
		</Field>
	)
}

function ErrorText(props: ComponentProps<"p">) {
	return (
		<p {...mergeClassProp(props, "text-red-400 text-center font-medium")} />
	)
}
