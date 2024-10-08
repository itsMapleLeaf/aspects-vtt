import { useMutation } from "convex/react"
import type { FunctionReference, OptionalRestArgs } from "convex/server"
import { DeleteForm } from "~/ui/DeleteForm.tsx"
import type { StrictOmit } from "../../../common/types"

export function ConvexDeleteForm<
	Fn extends FunctionReference<"mutation", "public">,
>({
	mutation,
	args,
	...props
}: StrictOmit<React.ComponentProps<typeof DeleteForm>, "onConfirmDelete"> & {
	mutation: Fn
	args: OptionalRestArgs<Fn>[0]
}) {
	const mutate = useMutation(mutation)
	return (
		<DeleteForm
			{...props}
			onConfirmDelete={async () => {
				await mutate(args)
			}}
		/>
	)
}
