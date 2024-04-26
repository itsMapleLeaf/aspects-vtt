import { Focusable } from "@ariakit/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { createNonEmptyContext, useNonEmptyContext } from "#app/common/context.js"
import { useEffectEvent } from "#app/common/react.js"
import type { StrictOmit } from "#app/common/types.js"
import { Button } from "./Button.tsx"
import { FormField, FormLayout } from "./Form.tsx"
import { Input } from "./Input.tsx"
import { Modal, ModalActions, ModalPanel, ModalPanelContent } from "./Modal.tsx"

type PromptState = {
	title: string
	inputLabel: React.ReactNode
	inputPlaceholder?: string
	buttonText?: React.ReactNode
	buttonIcon?: React.ReactNode
	resolve: (value: string | undefined) => void
}

const PromptContext = createNonEmptyContext<{
	currentPrompt: PromptState | undefined
	open: (state: PromptState) => void
	close: () => void
}>()

export function PromptProvider({ children }: { children: React.ReactNode }) {
	const [currentPrompt, setCurrentPrompt] = React.useState<PromptState>()
	return (
		<PromptContext
			value={{ currentPrompt, open: setCurrentPrompt, close: () => setCurrentPrompt(undefined) }}
		>
			{children}
			<Modal open={!!currentPrompt}>
				<ModalPanel title={currentPrompt?.title}>
					<ModalPanelContent>
						<PromptModalForm />
					</ModalPanelContent>
				</ModalPanel>
			</Modal>
		</PromptContext>
	)
}

function PromptModalForm() {
	const context = useNonEmptyContext(PromptContext)
	const [value, setValue] = React.useState("")
	return (
		<FormLayout
			action={() => {
				context.currentPrompt?.resolve(value)
				context.close()
			}}
		>
			<FormField label={context.currentPrompt?.inputLabel ?? ""}>
				<Focusable
					autoFocus
					render={
						<Input
							className="text-primary-100"
							value={value}
							placeholder={context.currentPrompt?.inputPlaceholder}
							onChange={(event) => setValue(event.target.value)}
						/>
					}
				/>
			</FormField>
			<ModalActions>
				<Button
					type="button"
					text="Cancel"
					icon={<Lucide.X />}
					onClick={() => {
						context.currentPrompt?.resolve(undefined)
						context.close()
					}}
				/>
				<Button
					type="submit"
					text={context.currentPrompt?.buttonText ?? "Submit"}
					icon={context.currentPrompt?.buttonIcon ?? <Lucide.Check />}
				/>
			</ModalActions>
		</FormLayout>
	)
}

export function usePrompt() {
	const context = useNonEmptyContext(PromptContext)
	return useEffectEvent((state: StrictOmit<PromptState, "resolve">) => {
		return new Promise<string | undefined>((resolve) => {
			context.open({ ...state, resolve })
		})
	})
}
