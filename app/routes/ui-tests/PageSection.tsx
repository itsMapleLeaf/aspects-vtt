interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
	title: string
}

export function PageSection({ children, title, ...props }: PageSectionProps) {
	return (
		<section {...props}>
			<h2 className="mb-2 text-2xl font-light">{title}</h2>
			{children}
		</section>
	)
}
