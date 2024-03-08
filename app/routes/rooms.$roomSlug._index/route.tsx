import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { api } from "convex-backend/_generated/api.js"
import { useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useCallback, useEffect } from "react"
import { $params, $path } from "remix-routes"
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
				<div className="flex w-[360px] flex-col">
					<div className="flex gap-2">
						<div className="flex-1">
							<CharacterSelect />
						</div>
						<CreateCharacterButton roomSlug={roomSlug} username={username} />
					</div>
				</div>
			</main>
		</div>
	)
}

function CharacterSelect() {
	const { roomSlug } = $params("/rooms/:roomSlug", useParams())
	const characters = useQuery(api.characters.list, { roomSlug })
	const [currentCharacterId, setCurrentCharacterId] = useCurrentCharacterId()
	const firstCharacterId = characters?.[0]?._id

	useEffect(() => {
		if (!currentCharacterId && firstCharacterId) {
			setCurrentCharacterId(firstCharacterId)
		}
	}, [currentCharacterId, firstCharacterId, setCurrentCharacterId])

	return (
		characters === undefined ? <Loading />
		: characters.length === 0 ?
			<p className="flex h-10 flex-row items-center px-2 opacity-60">No characters found.</p>
		:	<div className="relative flex flex-row items-center">
				<select
					className="block h-10 w-full appearance-none rounded border border-primary-300 bg-primary-200 pl-9"
					value={currentCharacterId ?? ""}
					onChange={(event) => {
						setCurrentCharacterId(event.target.value)
					}}
				>
					{characters.map((character) => (
						<option key={character._id} value={character._id}>
							{character.name}
						</option>
					))}
				</select>
				<Lucide.ChevronsUpDown className="pointer-events-none absolute left-2" />
			</div>
	)
}

function CreateCharacterButton({ roomSlug, username }: { roomSlug: string; username: string }) {
	const create = useMutation(api.characters.create)
	const [, setCurrentCharacterId] = useCurrentCharacterId()
	return (
		<Button
			icon={<Lucide.UserPlus2 />}
			title="New Character"
			onClick={async () => {
				const id = await create({ roomSlug, player: username })
				setCurrentCharacterId(id)
			}}
		/>
	)
}

function useCurrentCharacterId() {
	const [searchParams, setSearchParams] = useSearchParams()
	return [
		searchParams.get("character"),
		useCallback(
			(newCharacterId: string) => {
				setSearchParams(
					(params) => {
						params.set("character", newCharacterId)
						return params
					},
					{ replace: true },
				)
			},
			[setSearchParams],
		),
	] as const
}
