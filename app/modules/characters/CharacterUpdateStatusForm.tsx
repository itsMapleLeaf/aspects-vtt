import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { Input } from "~/ui/Input.tsx"
import { useNumberInput } from "~/ui/useNumberInput.tsx"
import { api } from "../../../convex/_generated/api"
import { Button } from "../../ui/Button.tsx"
import type { ApiCharacter } from "../characters/types.ts"
import { useSafeAction } from "../convex/hooks.ts"

export function CharacterUpdateStatusForm({
	characterIds,
}: {
	characterIds: Array<ApiCharacter["_id"]>
}) {
	const health = useNumberInput({ min: Number.NEGATIVE_INFINITY })
	const resolve = useNumberInput({ min: Number.NEGATIVE_INFINITY })

	const update = useMutation(api.characters.functions.updateStatus)

	const [, submit] = useSafeAction(async function submit(_: FormData) {
		await update({
			characterIds,
			health: health.value,
			resolve: resolve.value,
		})
		health.setValue(0)
		resolve.setValue(0)
	})

	return (
		<form className="flex gap-2" action={submit}>
			<Input
				tooltip="Health"
				icon={<Lucide.Heart />}
				placeholder="0"
				className="flex-1"
				{...health.props}
			/>
			<Input
				tooltip="Resolve"
				icon={<Lucide.Sun />}
				placeholder="0"
				className="flex-1"
				{...resolve.props}
			/>
			<Button
				type="submit"
				icon={<Lucide.Check />}
				square
				tooltip="Apply"
			></Button>
		</form>
	)
}
