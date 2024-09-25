import {
	GenericDocument,
	GenericMutationCtx,
	WithoutSystemFields,
} from "convex/server"
import { Iterator } from "iterator-helpers-polyfill"
import { DataModel, Doc, TableNames } from "../_generated/dataModel"

export function createMockMutationCtx() {
	const docs = new Map<string, GenericDocument>()

	return {
		db: {
			query: (table: string) => ({
				withIndex: (index: string, range: (q: unknown) => unknown) => {
					const indexValues: Record<string, unknown> = {}
					range({
						eq: (key: string, value: unknown) => {
							indexValues[key] = value
						},
					})
					return {
						collect: () => {
							return Promise.resolve(
								Iterator.from(docs.values())
									.filter((doc) => {
										for (const [key, value] of Object.entries(indexValues)) {
											if (doc[key] !== value) {
												return false
											}
										}
										return true
									})
									.toArray(),
							)
						},
					}
				},
			}),
			get: (id: string) => Promise.resolve(docs.get(id)),
			insert: <T extends TableNames>(
				table: T,
				doc: WithoutSystemFields<Doc<T>>,
			) => {
				const id = crypto.randomUUID()
				docs.set(id, {
					...doc,
					_id: id,
					_creationTime: Date.now(),
				})
				return Promise.resolve(id)
			},
			normalizeId: (table: string, id: string) => id,
		},
		auth: {
			getUserIdentity: () => Promise.resolve({ subject: "user1" }),
		},
		storage: {
			getUrl: () => Promise.resolve("https://example.com/background1"),
		},
	} as unknown as GenericMutationCtx<DataModel>
}
