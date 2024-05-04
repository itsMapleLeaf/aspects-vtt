import { LucideCheck, LucideChevronDown, LucideChevronUp } from "lucide-react"
import { type ComponentProps, useState } from "react"
import type { StrictOmit } from "../common/types.ts"
import { Button } from "./Button.tsx"
import { Input } from "./Input.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "./Popover.tsx"

export interface CounterInputProps extends StrictOmit<ComponentProps<"div">, "onChange"> {
	value: number
	min?: number
	max?: number
	step?: number
	onChange: (value: number) => void
}

export function CounterInput({
	value,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	step = 1,
	onChange,
}: CounterInputProps) {
	const [open, setOpen] = useState(false)
	return (
		<Popover open={open} setOpen={setOpen}>
			<div className="relative w-full">
				<PopoverTrigger render={<Button icon={undefined} text={value} className="w-full pl-0" />} />
				<div className="absolute inset-y-0 right-0 flex w-7 flex-col items-end justify-center">
					<button
						type="button"
						className="-my-[3px] block shrink opacity-50 transition-opacity hover:opacity-100"
					>
						<LucideChevronUp />
					</button>
					<button
						type="button"
						className="-my-[3px] block shrink opacity-50 transition-opacity hover:opacity-100"
					>
						<LucideChevronDown />
					</button>
				</div>
			</div>
			<PopoverPanel className="p-2" modal>
				<CounterInputForm
					min={min}
					max={max}
					step={step}
					defaultValue={value}
					onSubmit={(value) => {
						onChange(value)
						setOpen(false)
					}}
				/>
			</PopoverPanel>
		</Popover>
	)
}

function CounterInputForm({
	defaultValue,
	min,
	max,
	step,
	onSubmit,
}: {
	defaultValue: number
	min: number
	max: number
	step: number
	onSubmit: (value: number) => void
}) {
	const [input, setInput] = useState(String(defaultValue))
	const value = Number(input)
	const invalid = !/^\d+$/.test(input) || value < min || value > max

	function tweak(delta: number) {
		if (Number.isFinite(value)) {
			setInput(String(value + Math.sign(delta) * step))
		} else {
			setInput("0")
		}
	}

	return (
		<form action={() => onSubmit(value)} className="flex gap-2">
			<Input
				className="w-24"
				align="center"
				value={input}
				invalid={invalid}
				aria-invalid={invalid}
				onChange={(event) => setInput(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault()
						tweak(event.key === "ArrowUp" ? 1 : -1)
					}
				}}
				onWheel={(event) => {
					if (event.deltaY !== 0 && document.activeElement === event.currentTarget) {
						event.preventDefault()
						tweak(event.deltaY)
					}
				}}
			/>
			<Button type="submit" tooltip="Confirm" icon={<LucideCheck />} pending={false} />
		</form>
	)
}
