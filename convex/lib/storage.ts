import { Data, Effect, pipe } from "effect"
import { isNonNil } from "../../lib/validation.ts"
import { Id } from "../_generated/dataModel"
import { QueryContextService } from "./context.ts"

export class FileNotFoundError extends Data.TaggedError("FileNotFoundError") {}

export function getStorageUrl(id: Id<"_storage">) {
	return pipe(
		QueryContextService,
		Effect.flatMap((ctx) => Effect.promise(() => ctx.storage.getUrl(id))),
		Effect.filterOrFail(isNonNil, () => new FileNotFoundError()),
	)
}
