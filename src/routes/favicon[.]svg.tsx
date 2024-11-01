import {
	LucideDroplet,
	LucideFlame,
	LucideMoon,
	LucideSun,
	LucideTornado,
} from "lucide-react"
import { renderToStaticMarkup } from "react-dom/server"
import { ensure } from "../../lib/errors.ts"

const icons = [LucideFlame, LucideDroplet, LucideTornado, LucideSun, LucideMoon]

export function loader() {
	const Icon = ensure(icons[Math.floor(Math.random() * icons.length)])
	return new Response(
		renderToStaticMarkup(
			<Icon stroke="#8a96bc" fill="#141732" width="100%" height="100%" />,
		),
		{
			headers: {
				"Content-Type": "image/svg+xml",
				"Cache-Control": "no-store",
			},
		},
	)
}
