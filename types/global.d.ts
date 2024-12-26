import "@remix-run/node"
import "@total-typescript/ts-reset"
import "vite/client"

declare global {
	interface ImportMetaEnv {
		readonly VITE_CONVEX_URL: string
	}
}
