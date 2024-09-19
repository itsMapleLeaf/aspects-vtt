import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export interface ControlVariantProps
	extends VariantProps<typeof controlVariants> {
	className?: string
	class?: never // cva types are weird
}

/** The base style of all control elements, like buttons, inputs, etc. */
export const control = (props: ControlVariantProps) =>
	twMerge(controlVariants(props))

export const controlVariantNames = ["intent", "size", "disabled"] as const

export const controlVariants = cva(
	"flex items-center rounded-md border border-primary-600 bg-primary-700 transition hover:border-primary-500 active:duration-0",
	{
		variants: {
			intent: {
				default: "",
				danger: "",
			},
			size: {
				small: [
					"h-8 px-control-padding-sm text-sm gap-1 control-icon:-mx-0.5 control-icon:size-4",
				],
				medium: [
					"h-10 px-control-padding-md text-base gap-2.5 control-icon:-mx-1 control-icon:size-5",
				],
				large: [
					"h-12 px-control-padding-md text-lg gap-3 control-icon:-mx-1.5 control-icon:size-6",
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
	},
)
