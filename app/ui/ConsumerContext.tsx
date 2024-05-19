import {
	type ReactNode,
	createContext,
	use,
	useEffect,
	useMemo,
	useState,
} from "react"
import { useEffectEvent } from "../common/react.ts"

type Register = () => () => void

const RegisterContext = createContext<Register>(() => () => {})

export function useConsumerProvider() {
	const [count, setCount] = useState(0)

	const register = useEffectEvent(() => {
		setCount((it) => it + 1)
		return () => {
			setCount((it) => it - 1)
		}
	})

	const Provider = useMemo(() => {
		return function ConsumerCountProvider({
			children,
		}: {
			children: ReactNode
		}) {
			return <RegisterContext value={register}>{children}</RegisterContext>
		}
	}, [register])

	return { count, Provider }
}

export function useConsumer() {
	const register = use(RegisterContext)
	useEffect(register, [])
}
