import { AppHeader } from "~/components/AppHeader.tsx"
import Content from "../../docs/handbook.mdx"

export default function HandbookRoute() {
	return (
		<>
			<AppHeader />
			<main className="prose prose-slate prose-invert mx-auto w-full max-w-screen-sm px-4 py-12 [&_a:hover]:prose-h1:underline [&_a]:prose-h1:no-underline">
				<Content />
			</main>
		</>
	)
}
