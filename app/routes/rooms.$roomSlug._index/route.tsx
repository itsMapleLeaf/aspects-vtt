import { json, redirect } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData, useParams } from "@remix-run/react"
import * as Lucide from "lucide-react"
import { $params, $path } from "remix-routes"
import { DiceRollForm } from "~/features/dice/DiceRollForm"
import { DiceRollList } from "~/features/dice/DiceRollList"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { roomSlug } = $params("/rooms/:roomSlug", params)
	const preferences = await Preferences.fromRequest(request)
	preferences.update({ defaultRoomId: roomSlug })
	return preferences.response(
		preferences.username ?
			json({ username: preferences.username })
		:	redirect($path("/rooms/:roomSlug/setup", { roomSlug })),
	)
}

export default function RoomRoute() {
	const { username } = useLoaderData<typeof loader>()
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	return (
		<div className="flex h-dvh flex-col gap-2 bg-primary-100 p-2">
			<header className="flex justify-end gap-[inherit]">
				<Form method="post" action={$path("/rooms/:roomSlug/leave", { roomSlug })}>
					<Button
						type="submit"
						icon={<Lucide.DoorOpen />}
						text="Leave"
						name="clearUsername"
						value="do it"
					/>
				</Form>
				<Button to={`setup?username=${username}`} icon={<Lucide.Edit />} text={username} />
			</header>
			<main className="flex min-h-0 flex-1">
				<div className="flex h-full w-[360px] flex-col gap-2">
					<DiceRollForm username={username} roomSlug={roomSlug} />
					<div className="min-h-0 flex-1">
						<DiceRollList roomSlug={roomSlug} />
					</div>
				</div>
				<div className="flex-1">
					<p>something will go here</p>
				</div>
			</main>
		</div>
	)
}
