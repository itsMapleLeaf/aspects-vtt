import { Link } from "@remix-run/react"
import { LucideBan, LucideLink, LucidePointer } from "lucide-react"
import { Button } from "../ui/button.tsx"
import { Heading } from "../ui/heading.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Loading } from "../ui/loading.tsx"

export default function DesignSystem() {
	return (
		<Column className="gap-8 p-4">
			<section>
				<Heading className="mb-3 text-3xl text-base-300">Button</Heading>
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
			</section>

			<section>
				<Heading className="mb-3 text-3xl text-base-300">
					Loading animations
				</Heading>
				<Row>
					<Loading className="size-24" />
					<Loading className="size-12" />
					<Loading className="size-6" />
				</Row>
			</section>
		</Column>
	)
}
