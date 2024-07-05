import { useAutoAnimate } from "@formkit/auto-animate/react"
import { combineRefs } from "~/helpers/react/helpers.ts"

export function AutoAnimate(props: React.ComponentProps<"div">) {
	const [animateRef] = useAutoAnimate()
	return <div {...props} ref={combineRefs(animateRef, props.ref)} />
}
