import "@fontsource-variable/nunito"
import "react-toastify/dist/ReactToastify.css"
import "./root.css"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigate,
} from "@remix-run/react"
import { ConvexReactClient } from "convex/react"
import {
	LucideCheckCircle2,
	LucideInfo,
	LucideTriangleAlert,
	LucideXCircle,
} from "lucide-react"
import React from "react"
import { IconProps, Slide, ToastContainer } from "react-toastify"
import { twMerge } from "tailwind-merge"
import { Loading } from "./ui/loading.tsx"
import { clearPanel } from "./ui/styles.ts"

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className="text-pretty break-words bg-primary-900 text-primary-100"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" type="image/svg+xml" href="/convex.svg" />
				<Meta />
				<Links />
				<title>Aspects VTT</title>
			</head>
			<body>
				{children}
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
						clearPanel(
							context?.defaultClassName,
							twMerge("text-primary-100 transition hover:bg-opacity-100"),
							{
								default: "",
								success: twMerge(
									"border-emerald-700 bg-emerald-800 text-emerald-100",
								),
								info: twMerge("border-sky-700 bg-sky-800 text-sky-100"),
								warning: twMerge(
									"border-yellow-700 bg-yellow-800 text-yellow-100",
								),
								error: twMerge("border-rose-700 bg-rose-800 text-rose-100"),
							}[context?.type ?? "default"],
						)
					}
					icon={ToastIcon}
				/>
				<Scripts />
				<ScrollRestoration />
			</body>
		</html>
	)
}

export default function Root() {
	const [convex] = React.useState(
		() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL),
	)
	const navigate = useNavigate()

	return (
		<ConvexAuthProvider
			client={convex}
			replaceURL={(url) => navigate(url, { replace: true })}
		>
			<Outlet />
		</ConvexAuthProvider>
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
	return isLoading ? <Loading className="size-6" /> : element[type]
}
