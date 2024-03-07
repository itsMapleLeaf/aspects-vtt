export function Loading() {
	return (
		<div className="flex h-16 w-full items-center justify-center p-4">
			<div className="grid aspect-square h-full animate-spin grid-cols-2 gap-1 [animation-timing-function:ease]">
				<div className="aspect-square h-full rounded-md bg-primary-700" />
				<div className="aspect-square h-full rounded-md bg-primary-800" />
				<div className="aspect-square h-full rounded-md bg-primary-800" />
				<div className="aspect-square h-full rounded-md bg-primary-700" />
			</div>
		</div>
	)
}
