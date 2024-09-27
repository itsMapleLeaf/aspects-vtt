import {
	GenericDocument,
	GenericMutationCtx,
	WithoutSystemFields,
} from "convex/server"
import type { Value } from "convex/values"
import { Iterator } from "iterator-helpers-polyfill"
import { DataModel, Doc, TableNames } from "../_generated/dataModel"

export function createMockMutationCtx() {
	const docs = new Map<string, GenericDocument>()

	return {
		db: {
			query: (table: string) => createMockQuery(docs),
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
			patch: (id: string, fields: Record<string, Value>) => {
				docs.set(id, { ...docs.get(id), ...fields })
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

function createMockQuery(docs: Map<string, GenericDocument>) {
	type Expression<T> = (doc: GenericDocument) => T

	return {
		collect: () => [...docs.values()],

		withIndex: (index: string, range: (q: unknown) => unknown) => {
			const indexValues: Record<string, unknown> = {}
			range({
				eq: (key: string, value: unknown) => {
					indexValues[key] = value
				},
			})
			return createMockQuery(
				new Map(
					Iterator.from(docs).filter(([_, doc]) => {
						for (const [key, value] of Object.entries(indexValues)) {
							if (doc[key] !== value) {
								return false
							}
						}
						return true
					}),
				),
			)
		},

		filter: (predicate: (q: unknown) => Expression<Value>) => {
			const exp = predicate({
				or:
					(...conditions: Expression<boolean>[]): Expression<boolean> =>
					(item) =>
						conditions.some((c) => c(item)),

				field:
					(key: string): Expression<Value | undefined> =>
					(item) =>
						item[key],

				eq:
					(
						a: Value | Expression<Value>,
						b: Value | Expression<Value>,
					): Expression<boolean> =>
					(item) =>
						(typeof a === "function" ? a(item) : a) ===
						(typeof b === "function" ? b(item) : b),
			})

			return createMockQuery(
				new Map(Iterator.from(docs).filter(([_, doc]) => exp(doc))),
			)
		},
	}
}
