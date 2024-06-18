import { Link, useParams } from "@remix-run/react"
import type { ReactNode } from "react"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"

export default function UiTests() {
	return (
		<div className="h-full gap-4 p-4">
			<AppHeader />
			<div className="flex gap-4">
				<TestCaseNav />
				<TestCaseView />
			</div>
		</div>
	)
}

function TestCaseNav() {
	return (
		<nav className="flex w-[12rem] flex-col gap-2">
			{Object.keys(cases).map((slug) => (
				<Link key={slug} to={slug} className="text-primary-600 hover:underline">
					{slug}
				</Link>
			))}
		</nav>
	)
}

function TestCaseView() {
	const { slug } = useParams() as { slug: string }
	const testCase = cases[slug]
	return <div className="flex-1">{testCase}</div>
}

type TestCases = Record<string, ReactNode>

const cases: TestCases = {
	"scroll-area": (
		<div className="h-[300px] w-[300px]">
			<ScrollArea>
				<div className="h-[1000px] w-[1000px] bg-gradient-to-br from-blue-500 to-red-500" />
			</ScrollArea>
		</div>
	),
}
