import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"

export type ButtonVariantProps = VariantProps<typeof button>

const buttonVariants = cva(
	"flex items-center justify-center rounded-md border transition active:duration-0",
	{
		variants: {
			appearance: {
				solid: `border-primary-600 bg-primary-700 hover:border-primary-500 hover:bg-primary-600 active:bg-primary-500`,
				clear: `border-transparent opacity-60 hover:border-primary-700 hover:bg-primary-700 hover:opacity-100 active:border-primary-600 active:bg-primary-600`,
				outline: `border-primary-600 hover:border-primary-500 hover:bg-primary-700 active:bg-primary-600`,
			},
			intent: {
				default: "",
				danger: "",
			},
			size: {
				small: `text-sm gap-1.5 [--height:theme(spacing.7)] [--icon-inset:theme(spacing[0.5])] [--padding:theme(spacing.2)] [&>[data-button-icon]]:size-4 [&>svg]:size-4`,
				medium: `text-base gap-2 [--height:theme(spacing.10)] [--icon-inset:theme(spacing.1)] [--padding:theme(spacing.3)] [&>[data-button-icon]]:size-5 [&>svg]:size-5`,
				large: `text-lg gap-2.5 [--height:theme(spacing.12)] [--icon-inset:theme(spacing.1.5)] [--padding:theme(spacing.3)] [&>[data-button-icon]]:size-6 [&>svg]:size-6`,
			},
			shape: {
				default: `h-[--height] p-[--padding] [&>[data-button-icon]]:-mx-[--icon-inset] [&>svg]:-mx-[--icon-inset]`,
				square: `size-[--height]`,
				circle: `size-[--height] rounded-full`,
			},
			disabled: {
				true: `opacity-50`,
			},
		},
		compoundVariants: [],
		defaultVariants: {
			appearance: "solid",
			size: "medium",
			shape: "default",
		},
	},
)

export const button = (props: VariantProps<typeof buttonVariants>) =>
	twMerge(buttonVariants(props))
