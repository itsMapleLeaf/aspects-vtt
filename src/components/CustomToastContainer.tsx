import {
	LucideCheckCircle2,
	LucideInfo,
	LucideTriangleAlert,
	LucideXCircle,
} from "lucide-react"
import { Slide, ToastContainer, type IconProps } from "react-toastify"
import { twMerge } from "tailwind-merge"
import { LoadingIcon } from "./LoadingIcon.tsx"

export function CustomToastContainer() {
	return (
		<ToastContainer
			position="top-center"
			autoClose={5000}
			closeOnClick
			pauseOnFocusLoss
			draggable
			pauseOnHover
			transition={Slide}
			theme="dark"
			stacked
			className="z-10"
			toastClassName={(context) =>
				twMerge(
					context?.defaultClassName,
					"text-primary-100 hover:bg-opacity-100 transition",
					{
						default: "",
						success: twMerge(
							"border-emerald-700 bg-emerald-800 text-emerald-100",
						),
						info: twMerge("border-sky-700 bg-sky-800 text-sky-100"),
						warning: twMerge("border-yellow-700 bg-yellow-800 text-yellow-100"),
						error: twMerge("border-rose-700 bg-rose-800 text-rose-100"),
					}[context?.type ?? "default"],
				)
			}
			icon={ToastIcon}
		/>
	)
}

function ToastIcon({ type, isLoading }: IconProps) {
	const element = {
		error: <LucideXCircle />,
		success: <LucideCheckCircle2 />,
		warning: <LucideTriangleAlert />,
		info: <LucideInfo />,
		default: null,
	}
	return isLoading ? <LoadingIcon className="size-6" /> : element[type]
}
