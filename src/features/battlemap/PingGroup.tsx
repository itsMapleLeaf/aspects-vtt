import { useQuery } from "convex/react"
import { FunctionReturnType } from "convex/server"
import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Circle, Group, Text } from "react-konva"
import { api } from "~/convex/_generated/api.js"
import { Vec } from "~/lib/vec.ts"
import { ensure } from "../../../lib/errors.ts"
import { useRoomContext } from "../rooms/context.tsx"

type Ping = FunctionReturnType<typeof api.pings.list>[number]

export function PingGroup() {
	const roomId = useRoomContext()._id
	const pings = useQuery(api.pings.list, { roomId }) ?? []
	return (
		<Group>
			{pings.map((ping) => (
				<PingCircle key={ping.key} ping={ping} />
			))}
		</Group>
	)
}

function PingCircle({ ping }: { ping: Ping }) {
	const groupRef = useRef<Konva.Group>(null)
	const circleRef = useRef<Konva.Group>(null)
	const [visible, setVisible] = useState(true)

	useEffect(() => {
		const node = ensure(groupRef.current)

		node.opacity(1)

		const tween = new Konva.Tween({
			node,
			opacity: 0,
			duration: 2,
			easing: Konva.Easings.StrongEaseIn,
			onUpdate: () => {
				node.scale(Vec.from(1).dividedBy(node.getStage()?.scale() ?? 1))
			},
			onFinish: () => setVisible(false),
		})

		tween.play()
		return () => tween.destroy()
	}, [])

	useEffect(() => {
		const node = ensure(circleRef.current)

		// node.fill(getColor())

		node.scale({ x: 0.2, y: 0.2 })

		const tween = new Konva.Tween({
			node,
			scaleX: 1,
			scaleY: 1,
			duration: 2,
			easing: Konva.Easings.EaseOut,
		})

		tween.play()
		return () => tween.destroy()
	}, [])

	if (!visible) {
		return
	}

	return (
		<Group
			x={ping.position.x}
			y={ping.position.y}
			ref={groupRef}
			listening={false}
		>
			<Group ref={circleRef} fill="skyblue">
				<Circle
					radius={70}
					fill="#38bdf8"
					stroke="#075985"
					strokeWidth={2}
					opacity={0.7}
				></Circle>
				{/* <Circle radius={30} fill="#38bdf8" opacity={1}></Circle> */}
			</Group>
			<Text
				text={ping.user.name}
				fontSize={20}
				fontFamily="Nunito Variable"
				fontStyle="700"
				fill="#38bdf8"
				stroke="#075985"
				strokeWidth={4}
				fillAfterStrokeEnabled={true}
				align="center"
				verticalAlign="middle"
				x={-50}
				y={40}
				width={100}
			/>
		</Group>
	)
}
