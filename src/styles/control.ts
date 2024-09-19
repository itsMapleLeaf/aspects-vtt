import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export type ControlVariantProps = VariantProps<typeof controlVariants>

/** The base style of all control elements, like buttons, inputs, etc. */
export const control = (props: ControlVariantProps) =>
	twMerge(controlVariants(props))

export const controlVariantNames = ["intent", "size", "disabled"] as const

export const controlVariants = cva(
	"flex items-center justify-center rounded-md border border-primary-600 bg-primary-700 transition hover:border-primary-500 active:duration-0",
	{
		variants: {
			intent: {
				default: "",
				danger: "",
			},
			size: {
				small: [
					"h-8 px-2.5 text-sm gap-1 control-icon:-mx-0.5 control-icon:size-4",
				],
				medium: [
					"h-10 px-3.5 text-base gap-2.5 control-icon:-mx-1 control-icon:size-5",
				],
				large: [
					"h-12 px-4 text-lg gap-3 control-icon:-mx-1.5 control-icon:size-6",
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
