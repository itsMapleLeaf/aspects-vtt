import { useAuthActions } from "@convex-dev/auth/react"
import { SiDiscord } from "@icons-pack/react-simple-icons"
import { useConvexAuth, useQuery } from "convex/react"
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
	const auth = useConvexAuth()
	const loading = user === undefined || auth.isLoading
	return (
		<>
			{loading ? null : user === null ? (
				<AuthForm />
			) : (
				<WelcomeMessage user={user} />
			)}
			<LoadingCover visible={loading} />
		</>
	)
}

function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"bg-base-900 invisible fixed inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-1000",
				visible && "visible opacity-100",
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
	const [action, setAction] = useState<"login" | "register">("login")
	const [error, setError] = useState<string>()

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		auth.signIn("credentials", form).catch((error) => {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		})
	}

	return (
		<main className="flex h-screen min-h-fit flex-col gap-6 px-4 py-24 *:mx-auto *:shrink-0 first:*:mt-auto last:*:mb-auto">
			<HeadingLevel>
				<Heading className="max-w-80 text-balance text-center text-4xl">
					{action === "login" ? "Sign in" : "Create an account"} to continue.
				</Heading>

				<Panel className="w-[320px] p-4">
					<Column className="items-center">
						<Button
							icon={<SiDiscord />}
							onClick={() => {
								auth.signIn("discord").catch(console.error)
							}}
						>
							Continue with Discord
						</Button>

						<Row className="w-full items-center gap-2">
							<div className="bg-base-700 h-px flex-1"></div>
							<p className="text-base-400">or</p>
							<div className="bg-base-700 h-px flex-1"></div>
						</Row>

						<Heading className="text-xl">
							{action === "register" ? "Register" : "Sign in"} with a password
						</Heading>

						<form
							onSubmit={(event) => {
								handleSubmit(event)
							}}
							className="flex w-full flex-col gap-4"
						>
							<InputField
								type="text"
								name="handle"
								label="Account handle"
								description={
									action === "register" &&
									"You'll use this to sign in. Only use letters, numbers, underscores (_) and periods (.)."
								}
								required
							/>

							{action === "register" && (
								<InputField
									type="text"
									name="name"
									label="Display name"
									description={
										action === "register" && "This is the name others will see."
									}
									required
								/>
							)}

							<InputField
								type="password"
								name="password"
								label="Password"
								description={action === "register" && "Make it strong!"}
								required
							/>

							<input type="hidden" name="action" value={action} />

							<Button
								type="submit"
								className="self-center"
								icon={
									action === "login" ? <LucideDoorOpen /> : <LucideUserPlus />
								}
							>
								{action === "login" ? "Sign in" : "Create account"}
							</Button>

							{error && <ErrorText>{error}</ErrorText>}
						</form>
					</Column>
				</Panel>

				<p className="text-base-400 text-center">
					{action === "login" && (
						<>
							don't have an account?{" "}
							<button
								type="button"
								onClick={() => setAction("register")}
								className="text-base-200 cursor-pointer underline hover:no-underline"
							>
								register
							</button>
						</>
					)}
					{action === "register" && (
						<>
							already have an account?{" "}
							<button
								type="button"
								onClick={() => setAction("login")}
								className="text-base-200 cursor-pointer underline hover:no-underline"
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
				"bg-base-900 border-base-700 rounded border shadow",
				props.className,
			)}
		/>
	)
}

function Field({
	label,
	description,
	children,
	...props
}: ComponentProps<"div"> & {
	label: React.ReactNode
	description?: React.ReactNode
}) {
	return (
		<div {...mergeClassProp(props, "flex flex-col gap-1")}>
			<label htmlFor={props.id} className="text-sm font-bold leading-4">
				{label}
			</label>
			{children}
			{description && (
				<p className="text-base-400 text-sm leading-4">{description}</p>
			)}
		</div>
	)
}

function Input(props: ComponentProps<"input">) {
	return (
		<input
			{...mergeClassProp(
				props,
				"border-base-700 bg-base-800 text-base-300 rounded border p-2",
			)}
		/>
	)
}

function InputField({
	label,
	description,
	...props
}: ComponentProps<"input"> & {
	label: React.ReactNode
	description?: React.ReactNode
}) {
	return (
		<Field label={label} description={description}>
			<Input {...mergeClassProp(props, "w-full")} />
		</Field>
	)
}

function ErrorText(props: ComponentProps<"p">) {
	return (
		<p {...mergeClassProp(props, "text-center font-medium text-red-400")} />
	)
}
