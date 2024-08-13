import * as Lucide from "lucide-react"
import { useState } from "react"
import { normalizeAttributeValue } from "~/modules/attributes/helpers.ts"
import { getCharacterAttributeDiceKind } from "~/modules/characters/helpers.ts"
import { CheckboxField } from "~/ui/CheckboxField.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { hasLength } from "../../../common/array.ts"
import { clamp } from "../../../common/math.ts"
import { titleCase } from "../../../common/string.ts"
import type { PartialKeys } from "../../../common/types.ts"
import { api } from "../../../convex/_generated/api"
import { Button, type ButtonProps } from "../../ui/Button.tsx"
import { FormField } from "../../ui/Form.tsx"
import {
	Popover,
	PopoverDismiss,
	PopoverPanel,
	PopoverTrigger,
} from "../../ui/Popover.tsx"
import { panel } from "../../ui/styles.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useMutationAction } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import type { Attribute } from "./data.ts"

export function AttributeDiceRollButton({
	characters,
	attribute,
	icon = <Lucide.Dices />,
	tooltip = titleCase(attribute),
	children,
	"aria-label": ariaLabel = typeof children === "string" ? children : undefined,
	...buttonProps
}: {
	characters: ApiCharacter[]
	attribute: Attribute["id"]
} & PartialKeys<ButtonProps, "icon">) {
	const [boostCount, setBoostCount] = useState(0)
	const [snagCount, setSnagCount] = useState(0)
	const [pushYourself, setPushYourself] = useState(false)
	const [, rollAttribute] = useMutationAction(
		api.characters.functions.rollAttribute,
	)
	const [, updateCharacter] = useMutationAction(api.characters.functions.update)
	const { _id: roomId } = useRoom()

	const attributeDie =
		hasLength(characters, 1) && characters[0].permission === "full" ?
			getCharacterAttributeDiceKind(
				normalizeAttributeValue(characters[0][attribute]),
			)
		:	undefined

	return (
		<Popover placement="top">
			<div className="flex flex-col items-center gap-1">
				<PopoverTrigger
					render={
						<Button
							icon={icon}
							tooltip={tooltip}
							aria-label={ariaLabel}
							tooltipPlacement="bottom"
							{...withMergedClassName(buttonProps, "w-full")}
						/>
					}
				/>
				<div className="text-sm">{attributeDie?.name}</div>
			</div>
			<PopoverPanel
				portal
				gutter={8}
				unmountOnHide
				className="flex flex-col p-2 gap-2"
			>
				<div className="flex gap-current *:flex-1">
					<FormField label="Boost Dice">
						<CounterInput value={boostCount} onChange={setBoostCount} />
					</FormField>
					<FormField label="Snag Dice">
						<CounterInput value={snagCount} onChange={setSnagCount} />
					</FormField>
				</div>
				<CheckboxField
					label="Push yourself"
					checked={pushYourself}
					onChange={(event) => setPushYourself(event.target.checked)}
				/>
				<PopoverDismiss
					render={
						<Button
							icon={<Lucide.Dices />}
							onClick={() => {
								rollAttribute({
									roomId,
									characterIds: characters.map((character) => character._id),
									attribute,
									boostCount: boostCount + (pushYourself ? 1 : 0),
									snagCount,
								})

								if (pushYourself) {
									for (const character of characters) {
										if (character.permission !== "full") continue
										updateCharacter({
											id: character._id,
											resolve: character.resolve - 2,
										})
									}
								}

								setBoostCount(0)
								setSnagCount(0)
							}}
						>
							Roll
						</Button>
					}
				/>
			</PopoverPanel>
		</Popover>
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
				<Lucide.Minus />
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
				<Lucide.Plus />
			</button>
		</div>
	)
}
