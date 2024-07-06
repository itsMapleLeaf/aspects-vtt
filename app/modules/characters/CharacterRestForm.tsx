import * as Lucide from "lucide-react"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { useMutationAction } from "~/modules/convex/hooks.ts"
import { Button } from "~/ui/Button.tsx"
import { FormErrors, FormField, FormLayout } from "~/ui/Form.tsx"
import { Input } from "~/ui/Input.tsx"
import { api } from "../../../convex/_generated/api.js"
import { useNumberInput } from "../../ui/useNumberInput.js"

export function CharacterRestForm({ character }: { character: ApiCharacter }) {
	const hoursInput = useNumberInput({ defaultValue: 1, min: 1 })
	const [, rest] = useMutationAction(api.characters.functions.rest)
	return (
		<form
			action={() => {
				if (!hoursInput.valid) return
				rest({ id: character._id, hours: hoursInput.value })
			}}
			className="contents"
		>
			<FormLayout className="w-48">
				<FormField label="Hours">
					<FormErrors errors={hoursInput.validationError} />
					<Input {...hoursInput.props} align="center" placeholder="1" />
				</FormField>
				<Button type="submit" icon={<Lucide.FlameKindling />} disabled={!hoursInput.valid}>
					Rest
				</Button>
			</FormLayout>
		</form>
	)
}
