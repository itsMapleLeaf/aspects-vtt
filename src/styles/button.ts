import { cva, type VariantProps } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import {
	control,
	controlVariantNames,
	type ControlVariantProps,
} from "./control.ts"

export interface ButtonVariantProps
	extends VariantProps<typeof buttonVariants>,
		ControlVariantProps {}

export const button = ({
	appearance,
	square,
	rounded,
	...controlProps
}: ButtonVariantProps) =>
	twMerge(
		control({ ...controlProps }),
		buttonVariants({ appearance, square, rounded }),
	)

const uniqueButtonVariantNames = ["appearance", "square", "rounded"] as const

export const buttonVariantNames = [
	...controlVariantNames,
	...uniqueButtonVariantNames,
] as const

export const buttonVariants = cva("", {
	variants: {
		appearance: {
			solid: `border-primary-600 bg-primary-700 hover:border-primary-500 hover:bg-primary-600 active:bg-primary-500`,
			clear: `border-transparent bg-transparent opacity-60 hover:border-primary-700 hover:bg-primary-700 hover:opacity-100 active:border-primary-600 active:bg-primary-600`,
			outline: `border-primary-600 hover:border-primary-500 hover:bg-primary-700 active:bg-primary-600`,
		},
		square: {
			true: "aspect-square",
		},
		rounded: {
			true: "rounded-full",
		},
	} satisfies Record<(typeof uniqueButtonVariantNames)[number], unknown>,
	defaultVariants: {
		appearance: "solid",
	},
})
