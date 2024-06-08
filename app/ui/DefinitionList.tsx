import { Fragment } from "react"

type DefinitionListProps = {
	items: Iterable<{ name: string; description: string }>
}

export function DefinitionList({ items }: DefinitionListProps) {
	return (
		<dl className="grid gap-3 text-pretty empty:hidden">
			{Iterator.from(items)
				.map((item, index) => (
					<Fragment key={index}>
						<div key={index}>
							<dt className="text-lg/tight font-light">{item.name}</dt>
							<dd className="whitespace-pre-line text-pretty font-medium text-primary-800">
								{item.description.trim()}
							</dd>
						</div>
						<hr className="border-primary-300 last:hidden" />
					</Fragment>
				))
				.toArray()}
		</dl>
	)
}
