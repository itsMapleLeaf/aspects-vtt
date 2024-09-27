import { AppHeader } from "~/components/AppHeader.tsx"
import Content from "../../docs/handbook.md"

export default function HandbookRoute() {
	return (
		<>
			<AppHeader />
			<main className="prose prose-invert prose-slate mx-auto w-full max-w-screen-sm px-4 py-12">
				<Content />
			</main>
		</>
	)
}
