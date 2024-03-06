import { json, redirect } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const preferences = await Preferences.fromRequest(request)
	preferences.update({ defaultRoomId: params.roomId as string })
	return preferences.response(
		preferences.username
			? json({ username: preferences.username })
			: redirect(`/rooms/${params.roomId}/setup`),
	)
}

export default function RoomRoute() {
	const { username } = useLoaderData<typeof loader>()
	return (
		<div className="h-dvh p-2 gap-2 flex flex-col bg-primary-100">
			<header className="flex justify-end gap-[inherit]">
				<Form method="post" action="leave">
					<Button
						type="submit"
						icon={<Lucide.DoorOpen />}
						text="Leave"
						name="clearUsername"
						value="do it"
					/>
				</Form>
				<Button
					to={`setup?username=${username}`}
					icon={<Lucide.Edit />}
					text={username}
				/>
			</header>
			<main>
				<DiceRoller />
			</main>
		</div>
	)
}

function DiceRoller() {
	const [counts, setCounts] = useState<Record<number, number>>({})

	const diceKinds = [
		{ sides: 4, icon: <Lucide.Triangle /> },
		{ sides: 6, icon: <Lucide.Square /> },
		{ sides: 8, icon: <Lucide.Diamond /> },
		{ sides: 12, icon: <Lucide.Pentagon /> },
		{ sides: 20, icon: <Lucide.Hexagon /> },
	]

	return (
		<div className="flex flex-col gap-2">
			<div>{/* dice roll list */}</div>
			<div className="flex items-center gap-[inherit]">
				{diceKinds.map((kind) => (
					<div key={kind.sides} className="relative flex justify-center ">
						<Button
							// size="lg"
							icon={kind.icon}
							text={`${
								(counts[kind.sides] ?? 0) === 0 ? "" : counts[kind.sides]
							}d${kind.sides}`}
							data-faded={(counts[kind.sides] ?? 0) === 0}
							className="data-[faded=true]:opacity-60 tabular-nums"
							onClick={() =>
								setCounts((counts) => ({
									...counts,
									[kind.sides]: (counts[kind.sides] ?? 0) + 1,
								}))
							}
							onContextMenu={(event: React.MouseEvent) => {
								event.preventDefault()
								setCounts((counts) => ({
									...counts,
									[kind.sides]: Math.max((counts[kind.sides] ?? 0) - 1, 0),
								}))
							}}
						/>
						{/* <div className="absolute -bottom-1.5 bg-primary-300 rounded-md px-1 py-px font-medium shadow-md min-w-6 text-center text-sm tabular-nums empty:hidden pointer-events-none">
							{(counts[kind.sides] ?? 0) === 0 ? undefined : counts[kind.sides]}
						</div> */}
					</div>
				))}
				<div className="flex items-center justify-end flex-1 gap-[inherit]">
					{Object.values(counts).reduce((a, b) => a + b, 0) > 0 && (
						<Button
							text="Clear"
							icon={<Lucide.X />}
							onClick={() => setCounts({})}
						/>
					)}
					<Button text="Roll" icon={<Lucide.Dices />} />
				</div>
			</div>
		</div>
	)
}

function* range(...args: [start: number, end: number] | [end: number]) {
	const [start, end] = args.length === 1 ? [0, args[0]] : args
	for (let i = start; i < end; i++) {
		yield i
	}
}

function acceptPositiveInteger(input: unknown) {
	const number = Number(input)
	if (Number.isInteger(number) && number > 0) {
		return number
	}
}
