import * as React from "react"
import { useState } from "react"
import { useWindowEvent } from "../../helpers/dom/events.ts"
import { Rect } from "../../helpers/Rect.ts"

export function TokenLabel(props: { text: string; subText: string }) {
	const [visible, setVisible] = useState(false)
	const hoverAreaRef = React.useRef<HTMLDivElement>(null)

	// this needs to ignore pointer events for dragging and other stuff to work,
	// so we'll use a global listener and check position instead for this
	// TODO: use a portal instead, probably
	useWindowEvent("pointermove", (event) => {
		if (!hoverAreaRef.current) return
		const rect = Rect.from(hoverAreaRef.current.getBoundingClientRect())
		setVisible(rect.contains(event.clientX, event.clientY))
	})

	return (
		<>
			<div className="absolute inset-0" ref={hoverAreaRef} />
			<div
				className="flex-center absolute inset-x-0 top-full translate-y-2 opacity-0 transition-opacity data-[visible=true]:opacity-100"
				data-visible={visible}
			>
				<div className="flex-center whitespace-nowrap rounded bg-black/50 px-2.5 py-2 text-center shadow">
					<p className="text-lg/none">{props.text}</p>
					<p className="mt-0.5 whitespace-pre-line text-base opacity-75 empty:hidden">
						{props.subText}
					</p>
				</div>
			</div>
		</>
	)
}
