import { Link } from "@remix-run/react"
import { LucideBan, LucideLink, LucidePointer } from "lucide-react"
import { HeaderLayout } from "../ui/header-layout.tsx"
import { Heading, HeadingLevel } from "../ui/heading.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Loading } from "../ui/loading.tsx"
import { SkeletonGrid } from "../ui/skeleton.tsx"
import { clearButton, solidButton } from "../ui/styles.ts"

export default function DesignSystem() {
	return (
		<HeaderLayout>
			<div className="mx-auto flex w-full max-w-screen-sm flex-col items-stretch gap-8 p-4">
				<div className="grid grid-flow-col gap-2">
					<div className="bg-primary-100 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-200 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-300 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-400 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-500 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-600 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-700 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-800 aspect-square rounded-full border-2 border-white shadow"></div>
					<div className="bg-primary-900 aspect-square rounded-full border-2 border-white shadow"></div>
				</div>
				<PageSection title="Button">
					<Column className="gap-2">
						<Row className="items-center">
							<p>Solid</p>
							<button className={solidButton()}>
								<LucidePointer /> press.
							</button>
							<button className={solidButton()} disabled>
								<LucideBan /> but you cannot
							</button>
							<button className={solidButton()} disabled>
								<Loading data-button-icon /> loading...
							</button>
						</Row>
						<Row className="items-center">
							<p>Clear</p>
							<button className={clearButton()}>
								<LucidePointer />
								press.
							</button>
							<button className={clearButton()} disabled>
								<LucideBan />
								but you cannot
							</button>
							<button className={clearButton()}>
								<Loading data-button-icon />
								loading...
							</button>
						</Row>
						<Row className="items-center">
							<p>Icon only</p>
							<button className={clearButton()}>
								<LucidePointer />
							</button>
							<button className={clearButton()} disabled>
								<LucideBan />
							</button>
							<button className={clearButton()}>
								<Loading data-button-icon />
							</button>
						</Row>
						<Row className="items-center">
							<p>Link button</p>
							<Link to="?test" className={clearButton()}>
								<LucideLink />
								it's a link
							</Link>
						</Row>
					</Column>
				</PageSection>
				<PageSection title="Loading animations">
					<Row>
						<Loading className="size-24" />
						<Loading className="size-12" />
						<Loading className="size-6" />
					</Row>
				</PageSection>
				<PageSection title="Skeleton">
					<SkeletonGrid count={6} className="w-full max-w-screen-sm" />
				</PageSection>
			</div>
		</HeaderLayout>
	)
}

function PageSection({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<section>
			<HeadingLevel>
				<Heading className="mb-3 text-3xl text-base-300">{title}</Heading>
				{children}
			</HeadingLevel>
		</section>
	)
}
