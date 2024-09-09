import { Console, Effect, pipe } from "effect"
import { Id } from "../_generated/dataModel"
import { LocalQueryContext } from "./api.ts"

export function getStorageUrl(ctx: LocalQueryContext, id: Id<"_storage">) {
	return pipe(
		ctx.storage.getUrl(id),
		Effect.tapErrorTag("FileNotFound", (error) =>
			Console.warn(`File missing:`, error.info),
		),
		Effect.orElseSucceed(() => null),
	)
}
