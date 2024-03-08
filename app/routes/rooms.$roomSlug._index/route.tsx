import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import type { Id } from "convex-backend/_generated/dataModel.js"
import { useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useRef } from "react"
import { $params, $path } from "remix-routes"
import { CharacterForm } from "~/features/characters/CharacterForm"
import { CharacterSelect } from "~/features/characters/CharacterSelect"
import { CreateCharacterButton } from "~/features/characters/CreateCharacterButton"
import { useCurrentCharacterId } from "~/features/characters/useCurrentCharacterId.ts"
import { DiceRollForm } from "~/features/dice/DiceRollForm"
import { DiceRollList } from "~/features/dice/DiceRollList"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { panel } from "~/ui/styles.ts"

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

	const [characterId] = useCurrentCharacterId()
	const [character, characterPending] = useStableQueryValue(
		useQuery(api.characters.get, characterId ? { id: characterId as Id<"characters"> } : "skip"),
	)

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
				<Button
					element={<Link to={`setup?username=${username}`} />}
					icon={<Lucide.Edit />}
					text={username}
				/>
			</header>
			<main className="flex min-h-0 flex-1 gap-2">
				<div className="flex h-full w-[360px] flex-col gap-2">
					<DiceRollForm username={username} roomSlug={roomSlug} />
					<div className="min-h-0 flex-1">
						<DiceRollList roomSlug={roomSlug} />
					</div>
				</div>
				<div className={panel("flex-1")}>
					<p>map</p>
				</div>
				<div className="flex w-[360px] flex-col gap-2">
					<div className="flex gap-2">
						<div className="relative flex flex-1 items-center">
							<div className="flex-1">
								<CharacterSelect />
							</div>
							<div
								data-pending={characterPending}
								className="pointer-events-none absolute right-2 opacity-0 data-[pending=true]:opacity-100"
							>
								<Loading size="sm" />
							</div>
						</div>
						<CreateCharacterButton roomSlug={roomSlug} username={username} />
					</div>
					<div className="min-h-0 flex-1  data-[pending=true]:opacity-75">
						{character ?
							<CharacterForm character={character} />
						:	<Loading />}
					</div>
				</div>
			</main>
		</div>
	)
}

function useStableQueryValue<T>(value: T): readonly [value: T, pending: boolean] {
	const ref = useRef(value)
	if (ref.current !== value && value !== undefined) {
		ref.current = value
	}
	return [ref.current, value === undefined]
}
