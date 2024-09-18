import { twMerge } from "tailwind-merge"
import { LoadingIcon } from "./LoadingIcon.tsx"

export function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"pointer-events-none invisible absolute inset-0 flex items-center justify-center bg-primary-900 opacity-0 transition-all duration-1000",
				visible && "pointer-events-auto visible opacity-100",
			)}
		>
			<LoadingIcon className="size-24 opacity-50" />
		</div>
	)
}
