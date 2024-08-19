import { Fragment } from "react"

interface DefinitionListProps {
	items: Iterable<{ name: string; description: string }>
}

export function DefinitionList({ items }: DefinitionListProps) {
	const definitions = [...items]
	if (definitions.length === 0) return null
	return (
		<dl className="grid text-pretty gap-3 empty:hidden">
			{definitions.map((item, index) => (
				<Fragment key={index}>
					<div key={index}>
						<dt className="text-lg/tight font-light">{item.name}</dt>
						<dd className="whitespace-pre-line text-pretty font-medium text-primary-200">
							{item.description.trim()}
						</dd>
					</div>
					<hr className="border-primary-700 last:hidden" />
				</Fragment>
			))}
		</dl>
	)
}
