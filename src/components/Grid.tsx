import React from "react"

interface GridProps {
	children: React.ReactNode
}

export default function Grid({ children }: GridProps) {
	return (
		<div className="@container">
			<div className="grid gap-4 @lg:grid-cols-2 @2xl:grid-cols-3">
				{children}
			</div>
		</div>
	)
}
