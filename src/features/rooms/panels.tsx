import { mapValues } from "lodash-es"
import { Panel, PanelLocation, PanelProperties, Sidebar } from "./types.ts"

export interface PanelGroup {
	group: number
	panels: Panel[]
}

export function buildPanelGroups(
	panels: Record<string, PanelProperties>,
	panelLocations: Record<string, PanelLocation>,
): Record<Sidebar, PanelGroup[]> {
	const panelGroups: Record<Sidebar, Record<number, Panel[]>> = {
		left: {},
		right: {},
	}

	for (const [id, panel] of Object.entries(panels) as [
		string,
		PanelProperties,
	][]) {
		const location = panelLocations[id] ?? panel.defaultLocation
		const group = (panelGroups[location.sidebar][location.group] ??= [])
		group.push({ ...panel, id })
	}

	return mapValues(panelGroups, (groups) =>
		Object.entries(groups)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([group, panels]) => ({ group: Number(group), panels })),
	)
}
