import type { LoaderFunctionArgs } from "@remix-run/node"
import { z } from "zod"

const images = import.meta.glob(`./images/*/*.{webp,png,jpg,jpeg}`)

const schema = z.object({
	params: z.object({ race: z.string() }),
	query: z.object({ seed: z.coerce.number().positive().int().optional() }),
})

export async function loader({ request, ...args }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	const { params, query } = schema.parse({
		params: args.params,
		query: Object.fromEntries(url.searchParams),
	})

	const matchingImages = Object.entries(images).filter(([key]) =>
		key.startsWith(`./images/${params.race}`),
	)

	const offset = query.seed ?? 0
	const loadImage = matchingImages[offset % matchingImages.length]?.[1]

	if (!loadImage) {
		return new Response("No images available", { status: 404 })
	}

	const module = (await loadImage()) as { default: string }
	return fetch(new URL(module.default, url.origin))
}
