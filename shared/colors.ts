import { twMerge as tw } from "tailwind-merge"
import { keys } from "../app/common/object.ts"

interface UserColor {
	style: string
}

const baseStyle = tw("bg-opacity-50 hover:bg-opacity-75 text-white border")

const colors = {
	red: { style: tw(baseStyle, "bg-red-700 border-red-600") },
	orange: { style: tw(baseStyle, "bg-orange-700 border-orange-600") },
	yellow: { style: tw(baseStyle, "bg-yellow-700 border-yellow-600 ") },
	green: { style: tw(baseStyle, "bg-green-700 border-green-600") },
	blue: { style: tw(baseStyle, "bg-blue-700 border-blue-600") },
	purple: { style: tw(baseStyle, "bg-purple-700 border-purple-600") },
	pink: { style: tw(baseStyle, "bg-pink-700 border-pink-600") },
	fuchsia: { style: tw(baseStyle, "bg-fuchsia-700 border-fuchsia-600") },
} satisfies Record<string, UserColor>

export type UserColorName = keyof typeof colors

export function getColorNames() {
	return keys(colors)
}

export function getColorStyle(name: UserColorName) {
	return colors[name].style
}
