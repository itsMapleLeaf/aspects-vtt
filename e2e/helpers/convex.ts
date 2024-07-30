import { ConvexHttpClient } from "convex/browser"
import type { DocumentByName, WithoutSystemFields } from "convex/server"
import { api } from "../../convex/_generated/api.js"
import type { DataModel, TableNames } from "../../convex/_generated/dataModel.js"

export class ConvexTestDb {
	private readonly convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
	private docs = new Map<string, unknown>()

	async insert<T extends TableNames>(
		table: T,
		data: WithoutSystemFields<DocumentByName<DataModel, T>>,
	) {
		const doc = await this.convex.mutation(api.testing.create, {
			model: table,
			data,
		})
		this.docs.set(doc._id, doc)
		return doc as unknown as DocumentByName<DataModel, T>
	}

	async dispose() {
		await this.convex.mutation(api.testing.remove, {
			ids: [...this.docs.keys()],
		})
	}

	async [Symbol.asyncDispose]() {
		await this.dispose()
	}
}
