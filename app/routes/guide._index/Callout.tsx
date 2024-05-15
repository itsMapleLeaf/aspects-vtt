import { panel } from "../../ui/styles.ts"

export function Callout({ children }: { children: React.ReactNode }) {
	return <div className={panel("px-4 bg-primary-100 shadow-inner")}>{children}</div>
}
