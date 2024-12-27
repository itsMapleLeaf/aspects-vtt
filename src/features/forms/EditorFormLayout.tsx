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
			className={twMerge("gap flex flex-col", props.className)}
		>
			{children}
			<footer className="gap flex justify-end">
				<Button type="submit" icon={<LucideSave />}>
					Save
				</Button>
			</footer>
		</Form>
	)
}
