import { useMutation } from "convex/react"
import type { FunctionArgs, FunctionReference } from "convex/server"
import React from "react"
import { useSafeAction } from "./hooks.ts"

export function MutationButton<
	Func extends FunctionReference<"mutation", "public">,
>({
	mutationFunction,
	args,
	children,
}: {
	mutationFunction: Func
	args: FunctionArgs<Func>
	children: React.ReactElement<{ onClick?: () => void }>
}) {
	const [, mutate] = useSafeAction(useMutation(mutationFunction))
	return React.cloneElement(children, {
		onClick: () => mutate(args),
	})
}
