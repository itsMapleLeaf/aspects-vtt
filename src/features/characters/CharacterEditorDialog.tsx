import { LucideTrash2, Table } from "lucide-react"
import { ComponentProps, useRef } from "react"
import { Button } from "~/components/Button.tsx"
import { Dialog } from "~/components/Dialog.tsx"
import { Tabs } from "~/components/Tabs.tsx"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { textInput } from "~/styles/input.ts"
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table.tsx"
import {
	type ProfileEditorRef,
	CharacterProfileEditor,
} from "./CharacterProfileEditor.tsx"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
}) {
	const profileEditorRef = useRef<ProfileEditorRef>(null)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title="Edit Character"
				className="h-[800px]"
				onClose={() => {
					// profileEditorRef.current?.submit()
				}}
			>
				<div className="flex h-full min-h-0 flex-col gap-2">
					<Tabs.Root defaultActiveId="profile">
						<Tabs.List>
							<Tabs.Tab value="profile">Profile</Tabs.Tab>
							<Tabs.Tab value="inventory">Inventory</Tabs.Tab>
							<Tabs.Tab value="skills">Skills</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel
							id="profile"
							className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
						>
							<CharacterProfileEditor
								character={character}
								ref={profileEditorRef}
							/>
						</Tabs.Panel>

						<Tabs.Panel
							id="inventory"
							className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
						>
							<CharacterInventoryEditor />
						</Tabs.Panel>

						<Tabs.Panel
							id="skills"
							className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
						>
							<CharacterSkillsEditor />
						</Tabs.Panel>
					</Tabs.Root>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	)
}

function CharacterSkillsEditor() {
	return <p>skills</p>
}

function CharacterInventoryEditor() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Item</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{[
					{
						id: "1",
						name: "Dagger",
						description: "It's very sharp.",
						quantity: 2,
					},
					{
						id: "2",
						name: "Energy Drink",
						description: "Give yourself a boost.",
						quantity: 1,
					},
					{
						id: "3",
						name: "Rare Gem",
						description: "This probably sells for a lot.",
						quantity: 999,
					},
				].map((item) => (
					<TableRow key={item.id}>
						<TableCell>
							<p className="text-lg font-light leading-tight">{item.name}</p>
							<p className="font-semibold text-primary-200">
								{item.description}
							</p>
						</TableCell>
						<TableCell>
							<input
								defaultValue={item.quantity}
								className={textInput("w-20 text-center")}
							/>
						</TableCell>
						<TableCell>
							<Button
								appearance="clear"
								icon={<LucideTrash2 />}
								square
								type="button"
							></Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
