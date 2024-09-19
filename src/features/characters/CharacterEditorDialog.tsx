import { LucideSave, LucideTrash2, LucideX } from "lucide-react"
import { ComponentProps } from "react"
import { Button } from "~/ui/button.tsx"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/ui/dialog.tsx"
import { Input } from "~/ui/input.tsx"
import { Label } from "~/ui/label.tsx"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/ui/table.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/tabs.tsx"
import { Textarea } from "~/ui/textarea.tsx"
import { CharacterVitalFields } from "./CharacterVitalFields.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog> & {
	character: ApiCharacter
}) {
	return (
		<Dialog {...props}>
			{children}

			<DialogContent className="flex h-screen max-h-[800px] flex-col">
				<DialogHeader>
					<DialogTitle>Edit Character</DialogTitle>
				</DialogHeader>

				<Tabs>
					<TabsList>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="skills">Skills</TabsTrigger>
						<TabsTrigger value="inventory">Inventory</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-1">
								<Label>Name</Label>
								<Input />
							</div>
							<div className="flex flex-col gap-1">
								<Label>Pronouns</Label>
								<Input />
							</div>
							<div className="flex flex-col gap-1">
								<Label>Race</Label>
								<Input />
							</div>
							<div className="flex flex-col gap-1">
								<Label>Image</Label>
								<Input type="file" accept="image/*" />
							</div>
							<div className="flex flex-col gap-1">
								<Label>Attributes</Label>
								{/* todo */}
							</div>
							<CharacterVitalFields character={character} />
							<div className="flex flex-col gap-1">
								<Label>Wealth</Label>
								<Input />
							</div>
							<div className="flex flex-col gap-1">
								<Label>Notes</Label>
								<Textarea />
							</div>
						</div>
					</TabsContent>

					<TabsContent value="skills">
						<p>skills</p>
					</TabsContent>

					<TabsContent value="inventory">
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
											<p className="text-lg font-light leading-tight">
												{item.name}
											</p>
											<p className="font-semibold text-primary-200">
												{item.description}
											</p>
										</TableCell>
										<TableCell>
											<Input
												defaultValue={item.quantity}
												className="w-20 text-center"
											/>
										</TableCell>
										<TableCell>
											<Button variant="ghost">
												<LucideTrash2 />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<ul className="flex flex-col gap-2"></ul>
					</TabsContent>
				</Tabs>

				<DialogFooter className="mt-auto">
					<DialogClose asChild>
						<Button variant="outline">
							<LucideX /> Cancel
						</Button>
					</DialogClose>
					<Button>
						<LucideSave /> Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export { DialogTrigger as CharacterEditorDialogButton }
