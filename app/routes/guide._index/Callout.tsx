import { panel } from "../../ui/styles.ts"

export function Callout({ children }: { children: React.ReactNode }) {
	return <div className={panel("bg-primary-100 px-4 shadow-inner")}>{children}</div>
}
