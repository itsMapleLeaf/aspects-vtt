import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Brand } from "effect"
import {
	LucideAlertCircle,
	LucideAlertTriangle,
	LucideCheckCircle2,
	LucideInfo,
} from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"
import { translucentPanel } from "./styles.ts"

type ToastId = string & Brand.Brand<"ToastId">
const ToastId = Brand.nominal<ToastId>()

export interface ToastPresetOptions {
	title?: string
	body?: string
	duration?: number
}

export interface ToastOptions extends ToastPresetOptions {
	type?: "info" | "success" | "warning" | "error"
}

interface ToastState extends ToastOptions {
	id: ToastId
}

export interface ToastHandle {
	hide(): void
}

const ToastContext = React.createContext({
	add(toast: ToastOptions): ToastHandle {
		return { hide() {} }
	},
	info(options: ToastPresetOptions): ToastHandle {
		return { hide() {} }
	},
	success(options: ToastPresetOptions): ToastHandle {
		return { hide() {} }
	},
	warning(options: ToastPresetOptions): ToastHandle {
		return { hide() {} }
	},
	error(options: ToastPresetOptions): ToastHandle {
		return { hide() {} }
	},
})

export function Toaster({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<ToastState[]>([])

	function add({ duration = 5000, ...toast }: ToastOptions): ToastHandle {
		const id = ToastId(crypto.randomUUID())
		setToasts((toasts) => [...toasts, { ...toast, id, visible: true }])

		let timeout: ReturnType<typeof setTimeout> | undefined
		if (Number.isFinite(duration)) {
			timeout = setTimeout(() => {
				remove(id)
			}, duration)
		}

		return {
			hide() {
				remove(id)
				if (timeout) clearTimeout(timeout)
			},
		}
	}

	function remove(id: ToastId) {
		setToasts((toasts) => toasts.filter((it) => it.id !== id))
	}

	const info = (options: ToastPresetOptions) =>
		add({ ...options, type: "info" })
	const success = (options: ToastPresetOptions) =>
		add({ ...options, type: "success" })
	const warning = (options: ToastPresetOptions) =>
		add({ ...options, type: "warning" })
	const error = (options: ToastPresetOptions) =>
		add({ ...options, type: "error" })

	const context = {
		add,
		info,
		success,
		warning,
		error,
	}

	const [animateRef] = useAutoAnimate()

	return (
		<ToastContext.Provider value={context}>
			{children}
			<Portal>
				<div
					className="pointer-events-children fixed inset-y-0 left-0 z-10 flex flex-col justify-end p-3 gap-3"
					ref={animateRef}
				>
					{toasts.map((toast) => (
						<ToastElement
							{...toast}
							key={toast.id}
							onDismiss={() => remove(toast.id)}
						/>
					))}
				</div>
			</Portal>
		</ToastContext.Provider>
	)
}

function Portal({ children }: { children: React.ReactNode }) {
	const isClient = React.useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	)
	return isClient ? createPortal(children, document.body) : null
}

export function useToaster() {
	return React.useContext(ToastContext)
}

interface ToastElementProps extends ToastOptions {
	onDismiss: () => void
}

function ToastElement({
	type = "info",
	title,
	body,
	onDismiss,
}: ToastElementProps) {
	return (
		<button
			type="button"
			className={translucentPanel(
				"flex min-w-[280px] items-center px-3 py-2 text-left transition gap-3",
				type === "info" &&
					"border-blue-700 bg-blue-900 bg-opacity-90 hover:border-blue-500 hover:bg-opacity-100",
				type === "success" &&
					"border-green-700 bg-green-900 bg-opacity-90 hover:border-green-500 hover:bg-opacity-100",
				type === "warning" &&
					"border-orange-700 bg-orange-900 bg-opacity-90 hover:border-orange-500 hover:bg-opacity-100",
				type === "error" &&
					"border-red-700 bg-red-900 bg-opacity-90 hover:border-red-500 hover:bg-opacity-100",
			)}
			onClick={onDismiss}
		>
			{type === "info" && <LucideInfo className="text-blue-300" />}
			{type === "success" && <LucideCheckCircle2 className="text-green-300" />}
			{type === "warning" && (
				<LucideAlertTriangle className="text-orange-300" />
			)}
			{type === "error" && <LucideAlertCircle className="text-red-300" />}
			<div>
				{title && <h2 className="mt-1 text-xl/5 font-light">{title}</h2>}
				{body && <p>{body}</p>}
			</div>
		</button>
	)
}
