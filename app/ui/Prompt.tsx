import { Focusable } from "@ariakit/react"
import * as Lucide from "lucide-react"
import * as React from "react"
import { createNonEmptyContext, useNonEmptyContext } from "../common/context.tsx"
import { useEffectEvent } from "../common/react.ts"
import type { StrictOmit } from "../common/types.ts"
import { Button } from "./Button.tsx"
import { FormField, FormLayout } from "./Form.tsx"
import { Input } from "./Input.tsx"
import { ModalActions, ModalPanel, ModalPanelContent, ModalProvider } from "./Modal.tsx"

interface PromptState {
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
			value={{
				currentPrompt,
				open: setCurrentPrompt,
				close: () => setCurrentPrompt(undefined),
			}}
		>
			{children}
			<ModalProvider open={!!currentPrompt}>
				<ModalPanel title={currentPrompt?.title}>
					<ModalPanelContent>
						<PromptModalForm />
					</ModalPanelContent>
				</ModalPanel>
			</ModalProvider>
		</PromptContext>
	)
}

function PromptModalForm() {
	const context = useNonEmptyContext(PromptContext)
	const [value, setValue] = React.useState("")
	return (
		<form
			className="contents"
			action={() => {
				context.currentPrompt?.resolve(value)
				context.close()
			}}
		>
			<FormLayout>
				<FormField label={context.currentPrompt?.inputLabel ?? ""}>
					<Focusable
						autoFocus
						render={
							<Input
								className="bg-primary-100"
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
		</form>
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
