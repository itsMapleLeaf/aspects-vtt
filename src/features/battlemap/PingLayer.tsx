import { useQuery } from "convex/react"
import { api } from "~/convex/_generated/api.js"
import { Vec } from "~/shared/vec.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { Sprite, SpriteProps } from "./Sprite.tsx"

export function PingLayer({
	viewportScale,
	...props
}: SpriteProps & {
	viewportScale: number
}) {
	const room = useRoomContext()
	const pings = useQuery(api.pings.list, { roomId: room._id })
	const pingSize = 120
	return (
		<Sprite {...props}>
			{pings?.map((ping) => (
				<Sprite
					key={ping.key}
					position={Vec.from(ping.position)
						.times(viewportScale)
						.minus(pingSize / 2)}
					size={pingSize}
				>
					<svg
						className="size-full stroke-blue-300 drop-shadow-[0_0_4px_theme(colors.blue.900)] will-change-transform"
						viewBox="0 0 100 100"
						ref={animatePing}
					>
						<circle
							cx="50"
							cy="50"
							r="45"
							strokeWidth="6"
							strokeDasharray={(Math.PI * 90) / 8}
							fill="none"
						/>
					</svg>
					<p className="absolute inset-x-0 top-full text-center text-xl font-bold tracking-wide text-blue-200 delay-1000 duration-500 animate-out fade-out fill-mode-forwards [text-shadow:0_0_4px_theme(colors.blue.900)]">
						{ping.user.name}
					</p>
				</Sprite>
			))}
		</Sprite>
	)
}

function animatePing(element: SVGElement | null) {
	if (!element) return

	const controller = new AbortController()
	const signal = controller.signal

	void (async () => {
		try {
			const zoomDuration = 1000
			const blinkDuration = 75
			const blinkCount = 3
			const totalDuration = zoomDuration + blinkDuration * blinkCount * 2

			const zoomPromise = animate({
				element,
				keyframes: [
					{ transform: "scale(0.3) rotate(-10deg)" },
					{ transform: "scale(1) rotate(45deg)" },
				],
				duration: totalDuration,
				easing: "cubic-bezier(0, 0.2, 0.2, 1)",
				signal,
			}).catch((error) => {
				if (error instanceof Error && error.message === "aborted") {
					return
				}
				throw error
			})

			await wait(zoomDuration, { signal })
			for (let i = 1; i <= 3; i++) {
				element.style.opacity = "0"
				await wait(blinkDuration, { signal })
				element.style.opacity = String(1 - i / 3)
				await wait(blinkDuration, { signal })
			}
			element.style.opacity = "0"
			await zoomPromise
		} catch (error) {
			if (error instanceof Error && error.message === "aborted") {
				return
			}
			throw error
		}
	})()

	return () => {
		controller.abort()
	}
}

function animate({
	element,
	keyframes,
	duration,
	easing,
	signal,
}: {
	element: Element
	keyframes: Array<{ [key: string]: string }>
	duration: number
	easing: string
	signal: AbortSignal
}) {
	const animation = element.animate(keyframes, {
		duration,
		easing,
		fill: "forwards",
	})

	return new Promise<void>((resolve, reject) => {
		animation.addEventListener("finish", () => resolve(), { signal })

		signal.addEventListener("abort", () => {
			animation.cancel()
			reject(new Error("aborted"))
		})
	})
}

function wait(duration: number, options?: { signal: AbortSignal }) {
	return new Promise<void>((resolve, reject) => {
		const id = setTimeout(() => resolve(), duration)
		options?.signal.addEventListener("abort", () => {
			clearTimeout(id)
			reject(new Error("aborted"))
		})
	})
}
