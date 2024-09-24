import { useMutation } from "convex/react"
import * as v from "valibot"
import type { StrictOmit } from "~/common/types.ts"
import { longText, nonEmptyShortText } from "~/common/validators.ts"
import { api } from "~/convex/_generated/api.js"
import { wealthTier } from "~/features/characters/validators.ts"
import { WealthTierSelectField } from "~/features/characters/WealthTierSelectField.tsx"
import { EditorFormLayout } from "~/features/forms/EditorFormLayout.tsx"
import { InputField, TextAreaField } from "~/features/forms/fields.tsx"
import { useForm, valibotAction } from "~/features/forms/useForm.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { formRow } from "~/styles/forms.ts"
import type { ApiItem } from "./items.ts"

export function RoomItemForm({
	item,
	action,
}: {
	item: ApiItem
	action: (values: StrictOmit<ApiItem, "_id">) => unknown
}) {
	const room = useRoomContext()
	const update = useMutation(api.rooms.update)

	const form = useForm({
		initialValues: {
			...item,
		},
		action: valibotAction(
			v.object({
				name: nonEmptyShortText,
				effect: longText,
				flavor: v.optional(longText),
				wealthTier: wealthTier,
			}),
			action,
		),
	})

	return (
		<EditorFormLayout form={form} className="flex flex-col gap">
			<fieldset className={formRow()}>
				<InputField label="Name" field={form.fields.name} />
				<WealthTierSelectField field={form.fields.wealthTier} />
			</fieldset>
			<TextAreaField label="Effect" field={form.fields.effect} />
			<TextAreaField label="Flavor text" field={form.fields.flavor} />
		</EditorFormLayout>
	)
}