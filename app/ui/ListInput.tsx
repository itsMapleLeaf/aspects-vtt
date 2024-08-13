import { LucidePlus, LucideX } from "lucide-react"
import { type ReactNode, useState } from "react"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { Panel } from "~/ui/Panel.tsx"
import { ScrollArea } from "./ScrollArea.tsx"

interface ListInputProps {
	onAdd: (item: string) => unknown
	children: React.ReactNode
}

export function ListInput({ onAdd, children }: ListInputProps) {
	const [inputValue, setInputValue] = useState("")

	const action = async () => {
		const value = inputValue.trim()
		if (value) {
			await onAdd(value)
			setInputValue("")
		}
	}

	return (
		<div className="flex h-full flex-col gap-2">
			<form className="flex gap-current" action={action}>
				<Input
					type="text"
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					placeholder="Add new item..."
					className="flex-1"
				/>
				<Button type="submit" icon={<LucidePlus />} appearance="clear" square />
			</form>
			<div className="min-h-0 flex-1">
				<ScrollArea>
					<div className="flex flex-col gap-2">{children}</div>
				</ScrollArea>
			</div>
		</div>
	)
}

interface ListInputItemProps {
	children: ReactNode
	onRemove: () => void
}

export function ListInputItem({ children, onRemove }: ListInputItemProps) {
	return (
		<div className="flex gap-current">
			<Panel className="flex flex-1 items-center px-3">{children}</Panel>
			<Button
				type="submit"
				icon={<LucideX />}
				appearance="clear"
				square
				onClick={onRemove}
			/>
		</div>
	)
}
