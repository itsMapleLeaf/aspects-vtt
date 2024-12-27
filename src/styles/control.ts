import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { interactivePanel } from "./panel.ts"

export interface ControlVariantProps
	extends VariantProps<typeof controlVariants> {
	className?: string
	class?: never // cva types are weird
}

/** The base style of all control elements, like buttons, inputs, etc. */
export const control = (props: ControlVariantProps) =>
	twMerge(controlVariants(props))

export const controlVariantNames = ["intent", "size", "disabled"] as const

export const controlVariants = cva([interactivePanel(), "flex items-center"], {
	variants: {
		intent: {
			default: "",
			danger: "",
		},
		size: {
			small: [
				"px-control-padding-sm control-icon:-mx-0.5 control-icon:size-4 h-8 gap-1.5 text-sm",
			],
			medium: [
				"px-control-padding-md control-icon:-mx-1 control-icon:size-5 h-10 gap-2.5 text-base",
			],
			large: [
				"px-control-padding-md control-icon:-mx-1.5 control-icon:size-6 h-12 gap-3 text-lg",
			],
		},
		disabled: {
			true: "opacity-50",
		},
	} satisfies Record<(typeof controlVariantNames)[number], unknown>,
	compoundVariants: [],
	defaultVariants: {
		size: "medium",
	},
})
