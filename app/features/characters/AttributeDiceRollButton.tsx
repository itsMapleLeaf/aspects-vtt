import * as Ariakit from "@ariakit/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { clamp } from "#app/common/math.js"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/Form.js"
import { panel } from "#app/ui/styles.js"
import { useCreateAttributeRollMessage } from "./useCreateAttributeRollMessage.tsx"

export function AttributeDiceRollButton({
	attributeValue,
	buttonLabel,
	messageContent,
}: {
	attributeValue: number
	buttonLabel: string
	messageContent: string
}) {
	const createAttributeRollMessage = useCreateAttributeRollMessage()
	const [boostCount, setBoostCount] = useState(0)
	const [snagCount, setSnagCount] = useState(0)

	return (
		<Ariakit.HovercardProvider placement="left" timeout={350}>
			<Ariakit.HovercardAnchor>
				<Button
					icon={<Lucide.Dices />}
					text="Roll"
					aria-label={buttonLabel}
					onClick={async () => {
						await createAttributeRollMessage({
							content: messageContent,
							attributeValue,
						})
					}}
				/>
			</Ariakit.HovercardAnchor>

			<Ariakit.Hovercard
				className={panel(
					"flex w-64 translate-y-2 flex-col gap-3 bg-primary-100 p-3 opacity-0 shadow-md shadow-black/50 transition data-[enter]:translate-y-0  data-[enter]:opacity-100",
				)}
				portal
				gutter={8}
			>
				<div className="flex gap-2 *:flex-1">
					<FormField label="Boost Dice">
						<CounterInput value={boostCount} onChange={setBoostCount} />
					</FormField>
					<FormField label="Snag Dice">
						<CounterInput value={snagCount} onChange={setSnagCount} />
					</FormField>
				</div>
				<Button
					text="Roll"
					icon={<Lucide.Dices />}
					onClick={async () => {
						await createAttributeRollMessage({
							content: messageContent,
							attributeValue,
							boostCount,
							snagCount,
						})
						setBoostCount(0)
						setSnagCount(0)
					}}
				/>
			</Ariakit.Hovercard>
		</Ariakit.HovercardProvider>
	)
}

function CounterInput({
	value,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	onChange,
}: {
	value: number
	min?: number
	max?: number
	onChange: (value: number) => void
}) {
	const setValue = (value: number) => {
		onChange(Math.round(clamp(value, min, max)))
	}

	return (
		<div
			className={panel("relative flex h-10")}
			onWheel={(event) => {
				if (event.deltaY !== 0) {
					event.preventDefault()
					setValue(value - Math.sign(event.deltaY))
				}
			}}
		>
			<button
				type="button"
				className="relative px-2 opacity-50 hover:opacity-100"
				onClick={() => setValue(value - 1)}
			>
				<Lucide.ChevronLeft />
			</button>
			<button
				type="button"
				className="flex-1 cursor-ns-resize text-center tabular-nums"
				onKeyDown={(event) => {
					if (event.key === "ArrowUp" || event.key === "ArrowRight") {
						event.preventDefault()
						setValue(value + 1)
					} else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
						event.preventDefault()
						setValue(value - 1)
					}
				}}
				onDoubleClick={() => setValue(0)}
				onPointerDown={(event) => {
					const startValue = value
					const startY = event.clientY
					const sensitivity = 32 // pixels per unit

					document.body.classList.add("[&>*]:!cursor-ns-resize")

					const handleDrag = (event: PointerEvent) => {
						event.preventDefault()
						const deltaY = startY - event.clientY
						const deltaValue = deltaY / sensitivity
						setValue(startValue + deltaValue)
					}

					const handleDragEnd = (event: Event) => {
						event.preventDefault()
						window.removeEventListener("pointermove", handleDrag)
						window.removeEventListener("pointerup", handleDragEnd)
						window.removeEventListener("pointercancel", handleDragEnd)
						window.removeEventListener("blur", handleDragEnd)
						document.body.classList.remove("[&>*]:!cursor-ns-resize")
					}

					window.addEventListener("pointermove", handleDrag)
					window.addEventListener("pointerup", handleDragEnd)
					window.addEventListener("pointercancel", handleDragEnd)
					window.addEventListener("blur", handleDragEnd)
				}}
			>
				{value}
			</button>
			<button
				type="button"
				className="relative px-2 opacity-50 hover:opacity-100"
				onClick={() => setValue(value + 1)}
			>
				<Lucide.ChevronRight />
			</button>
		</div>
	)
}
