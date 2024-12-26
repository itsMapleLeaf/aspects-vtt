import { AppHeader } from "~/components/AppHeader.tsx"
import Content from "../../docs/handbook.mdx"

export default function HandbookRoute() {
	return (
		<>
			<AppHeader />
			<main className="prose prose-slate prose-invert mx-auto w-full max-w-(--breakpoint-sm) px-4 py-12 prose-h1:[&_a:hover]:underline prose-h1:[&_a]:no-underline">
				<Content />
			</main>
		</>
	)
}
