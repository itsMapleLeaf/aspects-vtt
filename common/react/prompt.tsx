/**
 * @example
 * 	// root.tsx
 * 	import { PromptProvider, Prompt } from "~/common/react/prompt.tsx"
 *
 * 	export default function Root() {
 * 		return (
 * 			<PromptProvider>
 * 				<TheRestOfTheApp />
 * 				<Prompt />
 * 			</PromptProvider>
 * 		)
 * 	}
 *
 * 	// somewhere else
 * 	import { usePrompt } from "~/common/react/prompt.tsx"
 * 	import { ConfirmModal } from "~/ui/ConfirmModal.tsx"
 *
 * 	export function DangerousAction() {
 * 		const prompt = usePrompt()
 * 		return (
 * 			<Button
 * 				onClick={async () => {
 * 					const yes = await prompt.show(ConfirmModal, {
 * 						title: "Are you sure you want to do this dangerous thing?",
 * 					})
 * 					if (yes) {
 * 						await doSomethingDangerous()
 * 					}
 * 				}}
 * 			>
 * 				Do something dangerous
 * 			</Button>
 * 		)
 * 	}
 *
 * 	// ConfirmModal.tsx
 * 	import { PromptComponentProps } from "~/common/react/prompt.tsx"
 * 	import {
 * 		ModalPanel,
 * 		ModalPanelContent,
 * 		ModalActions,
 * 	} from "~/ui/Modal.tsx"
 *
 * 	interface ConfirmModalProps extends PromptComponentProps<boolean> {
 * 		title: string
 * 	}
 *
 * 	export function ConfirmModal({ title, resolve }: PromptComponentProps) {
 * 		return (
 * 			<ModalPanel title={title}>
 * 				<ModalPanelContent>
 * 					<h1>{title}</h1>
 * 					<ModalActions>
 * 						<Button onClick={() => resolve(false)}>Cancel</Button>
 * 						<Button onClick={() => resolve(true)}>Confirm</Button>
 * 					</ModalActions>
 * 				</ModalPanelContent>
 * 			</ModalPanel>
 * 		)
 * 	}
 */

import React from "react"

type PromptRenderer = {
	render: () => React.ReactNode
}

function usePromptState() {
	const [renderers, setRenderers] = React.useState<PromptRenderer[]>([])
	return { renderers, setRenderers }
}

const PromptContext = React.createContext<ReturnType<
	typeof usePromptState
> | null>(null)

export function PromptProvider({ children }: { children: React.ReactNode }) {
	return <PromptContext value={usePromptState()}>{children}</PromptContext>
}

export function Prompt() {
	return null
}

export interface PromptComponentProps<Result> {
	resolve: (result: Result) => void
}

export function usePrompt() {
	return {
		show<Props extends PromptComponentProps<Result>, Result>(
			Component: React.ComponentType<Props>,
			props: Omit<Props, "resolve">,
		): Promise<Result> {
			throw new Error("Not implemented")
		},
	}
}
