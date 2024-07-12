import { Heading, LucideBan, LucidePointer } from "lucide-react"
import { Button } from "../ui/button.tsx"
import { Column, Row } from "../ui/layout.tsx"
import { Loading } from "../ui/loading.tsx"

export function DesignSystem() {
	return (
		<Column className="p-4 gap-8">
			<section>
				<Heading className="mb-3 text-3xl text-stone-300">Button</Heading>
				<Column className="gap-2">
					<Row className="items-center">
						<p>Solid</p>
						<Button appearance="solid" icon={<LucidePointer />}>
							press.
						</Button>
						<Button appearance="solid" icon={<LucideBan />} disabled>
							but you cannot
						</Button>
						<Button appearance="solid" pending>
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
						<Button appearance="clear" pending>
							loading...
						</Button>
					</Row>
					<Row className="items-center">
						<p>Icon only</p>
						<Button appearance="clear" icon={<LucidePointer />}></Button>
						<Button appearance="clear" icon={<LucideBan />} disabled></Button>
						<Button appearance="clear" pending></Button>
					</Row>
				</Column>
			</section>

			<section>
				<Heading className="mb-3 text-3xl text-stone-300">
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
