import type { ComponentPropsWithoutRef } from "react"
import type { StrictOmit } from "../../common/types.ts"

export function createDndModule<Data>() {
	function Draggable({ data, ...props }: { data: Data } & ComponentPropsWithoutRef<"div">) {
		return (
			<div
				{...props}
				draggable
				onDragStart={(event) => {
					event.dataTransfer.setData("text/plain", JSON.stringify(data))
					event.dataTransfer.dropEffect = "copy"
					props.onDragStart?.(event)
				}}
			/>
		)
	}

	function Dropzone(
		props: StrictOmit<ComponentPropsWithoutRef<"div">, "onDrop"> & {
			onDrop: (data: Data, event: React.DragEvent<HTMLDivElement>) => void
		},
	) {
		return (
			<div
				{...props}
				onDragOver={(event) => {
					event.preventDefault()
					props.onDragOver?.(event)
				}}
				onDrop={(event) => {
					event.preventDefault()
					try {
						const dataString = event.dataTransfer.getData("text/plain")
						if (!dataString) return
						const data = JSON.parse(dataString) as Data
						props.onDrop(data, event)
					} catch (error) {
						console.warn(error)
					}
				}}
			/>
		)
	}

	return { Draggable, Dropzone }
}
