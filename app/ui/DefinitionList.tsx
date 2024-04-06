import type { Nullish } from "#app/common/types.js"

type DefinitionListProps = {
	items?: Nullish<Nullish<{ name: string; description: string }>[]>
}

export function DefinitionList({ items }: DefinitionListProps) {
	return (
		<dl className="grid gap-3 text-pretty empty:hidden">
			{items?.filter(Boolean)?.map((item, index) => (
				<div key={index}>
					<dt className="text-lg/tight font-light">{item.name}</dt>
					<dd className="text-sm font-medium text-primary-800">{item.description}</dd>
				</div>
			))}
		</dl>
	)
}
