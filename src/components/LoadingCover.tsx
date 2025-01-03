import { twMerge } from "tailwind-merge"
import { LoadingIcon } from "./LoadingIcon.tsx"

export function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"bg-primary-900 absolute inset-0 flex items-center justify-center transition-all duration-1000",
				visible
					? "pointer-events-auto visible opacity-100"
					: "pointer-events-none invisible opacity-0",
			)}
		>
			<LoadingIcon className="size-24 opacity-50" />
		</div>
	)
}
