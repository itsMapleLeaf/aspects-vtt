import { render, screen } from "@testing-library/react"
import fireEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { SearchListLayout } from "./SearchListLayout.tsx"

vi.mock("@formkit/auto-animate/react", () => ({
	useAutoAnimate: () => [null],
}))

test("SearchListLayout renders and handles search correctly", async () => {
	const mockItems = [
		{ id: 1, name: "Item 1" },
		{ id: 2, name: "Item 2" },
		{ id: 3, name: "Item 3" },
	]

	const mockRenderItem = (item: { id: number; name: string }) => (
		<div key={item.id}>{item.name}</div>
	)

	let search = ""
	const handleSearch = (newSearch: string) => {
		search = newSearch
	}

	render(
		<SearchListLayout
			items={mockItems}
			itemKey="id"
			renderItem={mockRenderItem}
			onSearch={handleSearch}
		/>,
	)

	const searchInput = screen.getByPlaceholderText("Search...")
	expect(searchInput).toBeDefined()

	for (const item of mockItems) {
		expect(screen.getByText(item.name)).toBeDefined()
	}

	await fireEvent.type(searchInput, "Item 1")

	expect(search).toBe("Item 1")
	expect(searchInput).toHaveValue("Item 1")
})

test("SearchListLayout renders empty state when no items", () => {
	render(
		<SearchListLayout<{ id: string }>
			items={[]}
			itemKey="id"
			renderItem={() => null}
			onSearch={() => {}}
		/>,
	)

	expect(screen.getByText("Nothing here!")).toBeDefined()
})

test("SearchListLayout renders custom empty state", () => {
	render(
		<SearchListLayout<{ id: string }>
			items={[]}
			itemKey="id"
			renderItem={() => null}
			onSearch={() => {}}
			emptyStateText="Custom empty state"
		/>,
	)

	expect(screen.getByText("Custom empty state")).toBeDefined()
})
