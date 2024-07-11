import { Column, Row } from "./layout.tsx"
import { Loading } from "./loading.tsx"
import { Heading } from "./text.tsx"

export function DesignSystem() {
	return (
		<Column className="p-4">
			<Heading className="text-3xl text-stone-300">Loading animations</Heading>
			<Row>
				<Loading className="size-24" />
				<Loading className="size-12" />
				<Loading className="size-6" />
			</Row>
		</Column>
	)
}
