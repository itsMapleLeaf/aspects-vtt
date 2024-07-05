import { useMutation } from "convex/react"
import React from "react"
import { useSafeAction } from "~/modules/convex/hooks.ts"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { api } from "../../../convex/_generated/api.js"

export function NewSceneForm(props: React.FormHTMLAttributes<HTMLFormElement>) {
	const room = useRoom()
	const createScene = useMutation(api.scenes.functions.create)

	const [, action] = useSafeAction(async (_data: FormData) => {
		await createScene({ name: "New Scene", roomId: room._id })
	})

	return <form {...props} action={action} />
}
