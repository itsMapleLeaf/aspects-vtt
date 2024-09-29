import * as Ariakit from "@ariakit/react"

function Collapse(props: Ariakit.DisclosureProviderProps) {
	return <Ariakit.DisclosureProvider {...props} />
}

function Button(props: Ariakit.DisclosureProps) {
	return <Ariakit.Disclosure {...props} />
}

function Content({ children, ...props }: Ariakit.DisclosureContentProps) {
	return (
		<Ariakit.DisclosureContent
			{...props}
			className="grid grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,opacity] duration-200 data-[enter]:grid-rows-[1fr] data-[enter]:opacity-100"
		>
			<div className="min-h-0">{children}</div>
		</Ariakit.DisclosureContent>
	)
}

const module = Object.assign(Collapse, {
	Button,
	Content,
})
export { module as Collapse }
