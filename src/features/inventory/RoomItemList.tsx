import { useMutation } from "convex/react"
import {
	LucideCopy,
	LucideEdit,
	LucidePackagePlus,
	LucideTrash,
} from "lucide-react"
import { matchSorter } from "match-sorter"
import { useState } from "react"
import * as v from "valibot"
import { longText, nonEmptyShortText } from "~/common/validators.ts"
import { Button } from "~/components/Button.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { Heading } from "~/components/Heading.tsx"
import { Menu } from "~/components/Menu.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { formRow } from "~/styles/forms.ts"
import { textInput } from "~/styles/input.ts"
import { interactivePanel } from "~/styles/panel.ts"
import { secondaryHeading, subText } from "~/styles/text.ts"
import { wealthTier } from "../characters/validators.ts"
import { WealthTierSelectField } from "../characters/WealthTierSelectField.tsx"
import { EditorFormLayout } from "../forms/EditorFormLayout.tsx"
import { InputField, TextAreaField } from "../forms/fields.tsx"
import { useForm, valibotAction } from "../forms/useForm.ts"
import { useRoomContext } from "../rooms/context.tsx"
import type { ApiRoom } from "../rooms/types.ts"

type ApiItem = ApiRoom["items"][number]

export function RoomItemList() {
	const room = useRoomContext()
	const update = useMutation(api.rooms.update)

	const [search, setSearch] = useState("")
	const items = matchSorter(Object.values(room.items), search, {
		keys: ["name", "effect", "flavor", "wealthTier"],
	})

	const [editingItem, setEditingItem] = useState<ApiItem>()
	const [editorOpen, setEditorOpen] = useState(false)

	return (
		<div className="flex h-full flex-col p-gap pt-0 gap-2">
			<div className="flex gap-2">
				<input
					className={textInput("flex-1")}
					placeholder="Search..."
					value={search}
					onChange={(event) => setSearch(event.currentTarget.value)}
				/>
				<ToastActionForm
					action={async () => {
						setEditingItem({
							_id: crypto.randomUUID(),
							name: "Amazing Shiny Object",
							effect: "It probably does something cool.",
							wealthTier: 3,
						})
						setEditorOpen(true)
					}}
				>
					<Button type="submit" icon={<LucidePackagePlus />} appearance="clear">
						<span className="sr-only">Add item</span>
					</Button>
				</ToastActionForm>
			</div>
			<ul className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-2">
				{items.map((item) => (
					<li key={item._id}>
						<Menu
							className={interactivePanel(
								"flex w-full cursor-default flex-col p-2 text-left gap-1.5",
							)}
							providerProps={{
								placement: "right",
							}}
							options={[
								{
									icon: <LucideEdit />,
									label: "Edit",
									onClick: () => {
										setEditingItem(item)
										setEditorOpen(true)
									},
								},
								{
									icon: <LucideCopy />,
									label: "Clone",
									onClick: () => {
										setEditingItem({
											...item,
											_id: crypto.randomUUID(),
											name: `Copy of ${item.name}`,
										})
										setEditorOpen(true)
									},
								},
								{
									icon: <LucideTrash />,
									label: "Delete",
									onClick: () => {
										update({
											roomId: room._id,
											items: {
												[item._id]: null,
											},
										})
									},
								},
							]}
						>
							<Heading className={secondaryHeading()}>{item.name}</Heading>
							<p className="-mb-0.5 -mt-1 leading-snug empty:hidden">
								{item.effect}
							</p>
							<aside className={subText("italic empty:hidden")}>
								{item.flavor}
							</aside>
						</Menu>
					</li>
				))}
			</ul>
			<Dialog.Root open={editorOpen} setOpen={setEditorOpen}>
				<Dialog.Content title="Edit item">
					{editingItem && <RoomItemForm item={editingItem} />}
				</Dialog.Content>
			</Dialog.Root>
		</div>
	)
}

function RoomItemForm({ item }: { item: ApiItem }) {
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
			async (values) => {
				await update({
					roomId: room._id,
					items: {
						[item._id]: values,
					},
				})
			},
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
