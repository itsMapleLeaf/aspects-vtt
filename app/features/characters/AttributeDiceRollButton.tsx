import * as Ariakit from "@ariakit/react"
import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { clamp } from "#app/common/math.js"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/FormField.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { boostDiceKind, snagDiceKind } from "../dice/diceKinds.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function AttributeDiceRollButton({
	attributeValue,
	buttonLabel,
	messageContent,
	stress,
}: {
	attributeValue: number
	buttonLabel: string
	messageContent: string
	stress: number
}) {
	const room = useRoom()
	const createMessage = useMutation(api.messages.create)
	const baseDice = [{ name: `d${attributeValue}`, sides: attributeValue, count: 1 }]
	const [boostCount = 0, setBoostCount] = useState<number>()
	const [snagCount = stress, setSnagCount] = useState<number>()

	return (
		<Ariakit.HovercardProvider placement="left" timeout={350}>
			<Ariakit.HovercardAnchor>
				<Button
					icon={<Lucide.Dices />}
					text="Roll"
					aria-label={buttonLabel}
					onClick={async () => {
						await createMessage({
							roomId: room._id,
							content: messageContent,
							dice: [
								...baseDice,
								{ name: snagDiceKind.name, sides: snagDiceKind.faces.length, count: stress },
							],
						}).catch((error) => {
							alert(
								error instanceof ConvexError ? error.message : "Something went wrong, try again.",
							)
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
						await createMessage({
							roomId: room._id,
							content: messageContent,
							dice: [
								...baseDice,
								{ name: "boost", sides: boostDiceKind.faces.length, count: boostCount },
								{ name: "snag", sides: snagDiceKind.faces.length, count: snagCount },
							],
						}).catch((error) => {
							alert(
								error instanceof ConvexError ? error.message : "Something went wrong, try again.",
							)
						})
						setBoostCount(undefined)
						setSnagCount(undefined)
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
