import luna from "./assets/luna.png"
import map from "./assets/map.jpg"
import priya from "./assets/priya.png"

const room = {
	name: "Rosenfeld",
	scenes: [
		{
			id: "inner-rosenfeld",
			name: "Inner Rosenfeld",
			background: map,
		},
	],
	characters: [
		{
			id: "luna",
			sceneId: null,
			name: "Luna",
			pronouns: "she/her",
			race: "Renari",
			image: luna,
			attributes: {
				strength: 4,
				mobility: 5,
				sense: 4,
				intellect: 2,
				wit: 4,
			},
			vitals: {
				health: null, // null is max
				resolve: null, // null is max
			},
			wealth: 4, // tier index from 0 to 8
			notes: "",
			inventory: [
				{
					id: "dagger",
					itemId: "dagger",
					quantity: 2,
				},
				{
					id: "herbal-tea",
					itemId: "herbal-tea",
					quantity: 1,
				},
			],
		},
		{
			id: "priya",
			sceneId: "inner-rosenfeld",
			name: "Priya",
			pronouns: "she/her",
			race: "Umbraleth",
			image: priya,
			attributes: {
				strength: 4,
				mobility: 5,
				sense: 4,
				intellect: 2,
			},
			vitals: {
				health: null, // null is max
				resolve: null, // null is max
			},
			wealth: 6, // tier index from 0 to 8
			notes: "",
			inventory: [
				{
					id: "energy-drink",
					itemId: "energy-drink",
					quantity: 5,
				},
			],
		},
	],
	items: [
		{
			id: "map",
			name: "Map",
			description: "A map of the area.",
		},
		{
			id: "dagger",
			name: "Dagger",
			description: "It's very sharp.",
		},
		{
			id: "herbal-tea",
			name: "Herbal Tea",
			description: "Heals some health.",
		},
		{
			id: "energy-drink",
			name: "Energy Drink",
			description: "Boosts resolve.",
		},
	],
	messages: [
		{
			id: "luna-map",
			characterId: "luna",
			content: "I found a map in the house. Maybe it'll help us find our way.",
		},
		{
			id: "dice-rolls",
			diceRolls: [
				{
					id: "normal",
					dieId: "d12",
					result: 8,
				},
				{
					id: "boost",
					dieId: "boost",
					result: 5,
				},
			],
		},
	],
	combat: {
		members: [
			{
				id: "luna",
				characterId: "luna",
				initiative: 10,
			},
			{
				id: "priya",
				characterId: "priya",
				initiative: 4,
			},
		],
		currentMemberId: "luna",
		roundNumber: 1,
	},
}

export function useRoom() {
	return room
}
