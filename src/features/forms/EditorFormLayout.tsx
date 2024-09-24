import { LucideSave } from "lucide-react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/Button.tsx"
import { Form } from "~/features/forms/Form.tsx"

export function EditorFormLayout({
	form,
	children,
	...props
}: ComponentProps<typeof Form>) {
	return (
		<Form
			{...props}
			form={form}
			className={twMerge("flex flex-col gap", props.className)}
		>
			{children}
			<footer className="flex justify-end gap">
				<Button type="submit" icon={<LucideSave />}>
					Save
				</Button>
			</footer>
		</Form>
	)
}
