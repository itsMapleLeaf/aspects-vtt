import { HashMap } from "effect"
import * as React from "react"
import { Vector } from "../../common/vector.ts"
import { useRoom, type ApiRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"

const pingAnimationDuration = 2500

export function PingLayer() {
	const room = useRoom()
	const lastPingRef = React.useRef<ApiRoom["ping"]>(undefined)
	const [pings, setPings] = React.useState(HashMap.empty<string, Ping>())

	React.useEffect(() => {
		if (room.ping === undefined) {
			return
		}

		if (lastPingRef.current === undefined) {
			lastPingRef.current = room.ping
			return
		}

		if (room.ping.key === lastPingRef.current.key) {
			return
		}

		lastPingRef.current = room.ping

		const id = String(crypto.randomUUID())

		setPings(
			HashMap.set(id, {
				...room.ping,
				position: Vector.from(room.ping.position),
			}),
		)

		setTimeout(() => {
			setPings(HashMap.remove(id))
		}, pingAnimationDuration)
	}, [room.ping])

	return HashMap.toEntries(pings).map(([id, ping]) => <PingElement key={id} ping={ping} />)
}

type Ping = {
	position: Vector
	colorHue: number
	name: string
}

function PingElement({ ping }: { ping: Ping }) {
	const context = useSceneContext()

	const translate = Vector.from(ping.position).times(context.viewport.scale).css.translate()

	const style = {
		translate,
		"--theme-hue": ping.colorHue,
		animationDuration: `${pingAnimationDuration}ms`,
		animationIterationCount: 1,
		animationFillMode: "both",
	} as React.CSSProperties

	return (
		<>
			<div
				className="absolute -left-6 -top-6 size-12 animate-ping rounded-full bg-primary-700"
				style={style}
			/>
			<div className="absolute left-0 top-0 animate-out fade-out" style={style}>
				<p className="-translate-x-1/2 translate-y-12 text-center text-xl/tight font-medium text-primary-700 ">
					{ping.name}
				</p>
			</div>
		</>
	)
}
