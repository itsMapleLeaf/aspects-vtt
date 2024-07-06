import * as Lucide from "lucide-react"
import { ConfirmModalForm } from "~/ui/ConfirmModalForm.tsx"

export function DeleteForm({
	kind,
	name,
	onConfirmDelete,
	...props
}: Partial<React.ComponentProps<typeof ConfirmModalForm>> & {
	kind: string
	name: string
	onConfirmDelete: () => Promise<unknown>
}) {
	return (
		<ConfirmModalForm
			title={`Delete ${kind}`}
			message={`Are you sure you want to delete ${name}?`}
			confirmText="Yes, delete"
			confirmIcon={<Lucide.Trash />}
			cancelText="No, keep"
			cancelIcon={<Lucide.X />}
			onConfirm={onConfirmDelete}
			{...props}
		/>
	)
}
