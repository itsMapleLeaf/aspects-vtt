import { Link } from "@remix-run/react"
import { LucideBan, LucideLink, LucidePointer } from "lucide-react"
import { Button } from "../ui/button.tsx"
import { HeaderLayout } from "../ui/header-layout.tsx"
import { Heading, HeadingLevel } from "../ui/heading.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Loading } from "../ui/loading.tsx"
import { SkeletonGrid } from "../ui/skeleton.tsx"

export default function DesignSystem() {
	return (
		<HeaderLayout>
			<Column className="mx-auto w-full max-w-screen-sm items-stretch gap-8 p-4">
				<PageSection title="Button">
					<Column className="gap-2">
						<Row className="items-center">
							<p>Solid</p>
							<Button appearance="solid" icon={<LucidePointer />}>
								press.
							</Button>
							<Button appearance="solid" icon={<LucideBan />} disabled>
								but you cannot
							</Button>
							<Button appearance="solid" icon={null} pending>
								loading...
							</Button>
						</Row>
						<Row className="items-center">
							<p>Clear</p>
							<Button appearance="clear" icon={<LucidePointer />}>
								press.
							</Button>
							<Button appearance="clear" icon={<LucideBan />} disabled>
								but you cannot
							</Button>
							<Button appearance="clear" icon={null} pending>
								loading...
							</Button>
						</Row>
						<Row className="items-center">
							<p>Icon only</p>
							<Button appearance="clear" icon={<LucidePointer />}></Button>
							<Button appearance="clear" icon={<LucideBan />} disabled></Button>
							<Button appearance="clear" icon={null} pending></Button>
						</Row>
						<Row className="items-center">
							<p>Link button</p>
							<Button element={<Link to="?test" />} icon={<LucideLink />}>
								it's a link
							</Button>
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
			</Column>
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
