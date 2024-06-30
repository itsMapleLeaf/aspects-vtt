import { LucideCheck, LucideTrash, LucideX } from "lucide-react"
import { Button } from "~/ui/Button.tsx"
import { ConfirmModalButton } from "~/ui/ConfirmModalButton.tsx"
import { useToaster } from "~/ui/Toaster.tsx"
import { PageSection } from "./ui-tests/PageSection.tsx"

export default function ConfirmModalTest() {
	const toast = useToaster()
	return (
		<>
			<PageSection title="Success">
				<ConfirmModalButton
					title="Confirm"
					message="Are you sure?"
					confirmText="Yes"
					confirmIcon={<LucideCheck />}
					cancelText="No"
					cancelIcon={<LucideX />}
					onConfirm={async () => {
						await sleep(1000)
						toast.success({ title: "Nice!", body: "Confirmed" })
					}}
					render={<Button text="Confirm" icon={<LucideTrash />} />}
				/>
			</PageSection>
			<PageSection title="Error">
				<ConfirmModalButton
					title="Confirm"
					message="Are you sure?"
					confirmText="Yes"
					confirmIcon={<LucideCheck />}
					cancelText="No"
					cancelIcon={<LucideX />}
					onConfirm={() => {
						throw new Error("oops")
					}}
					render={<Button text="Confirm (error)" icon={<LucideTrash />} />}
				/>
			</PageSection>
		</>
	)
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
