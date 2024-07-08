export function Row({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-flow-col gap-4">{children}</div>
}

export function Column({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>
}
