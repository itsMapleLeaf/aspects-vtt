import { twMerge } from "tailwind-merge"
import { Input } from "~/ui/input.tsx"
import { Label } from "~/ui/label.tsx"

export function CharacterVitalFields({ className }: { className?: string }) {
	return (
		<div className={twMerge("flex gap *:min-w-0 *:flex-1", className)}>
			<div className="flex flex-col gap-0.5">
				<Label>Health</Label>
				<Input />
			</div>
			<div className="flex flex-col gap-0.5">
				<Label>Resolve</Label>
				<Input />
			</div>
		</div>
	)
}
