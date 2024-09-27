# Aspects of Nature

Aspects of Nature is a tabletop roleplaying game. One player plays as the the Game Master (GM for short, also known as the Dungeon Master, or DM), and everyone else plays as a Player Character (PC).

The GM orchestrates a campaign for the players: a set of scenarios where the players act from the perspective of their characters, doing what they would do. Overall, the game is structured as a back-and-forth, where the GM builds a story alongside the PCs.

> TODO: mention when rolls/combat/etc. come in

This game system was designed with a focus on **narrative** (1) and **flexibility** (2):

1. More fun is had when a good story is had. To the best of their ability, **players should act in narratively interesting ways**, sticking to their character’s personality and doing what they would do, even if it’s not the most advantageous move from a gameplay standpoint.

2. **Players should feel free to act however they like**, within reason, within the rules of the game, and within the rules of the world they’re in, even if their action isn’t [[#Actions\|codified in the game system]].

# Character Sheet

```
Name:
Gender:
Pronouns:
Race:
Alignment:
Faction:
Homeland:
Bio:

Strength:
Mobility:
Sense:
Intellect:
Wit:

Health: x/x
Resolve: x/x
Wealth:
```

## Example Character

```
Name: Luna
Gender: Female
Pronouns: she/her
Race: Renari
Alignment: Chaotic Good
Faction: Protection, leaning Singular
Homeland: Rosenfeld
Bio: angsty gay fox girl who does parkour

Strength: 3 (d8)
Mobility: 5 (d12)
Sense: 4 (d10)
Intellect: 1 (d4)
Wit: 2 (d6)

Health: 20/20
Resolve: 7/7
Wealth: Lower Middle Class
```

# Attributes

| Attribute | Type     | Description                                                 |
| --------- | -------- | ----------------------------------------------------------- |
| Strength  | Physical | lifting things, breaking things, punching people            |
| Mobility  | Physical | running fast, climbing, swimming, dodging                   |
| Sense     | Mental   | finding and seeing things, staying focused, keeping resolve |
| Intellect | Mental   | retaining and recalling knowledge, logical reasoning        |
| Wit       | Mental   | social prowess, reading the feelings and intent of others   |

## Attribute Dice Assignment

- 15 points to allocate to attributes
- Each one must have 1 to 5
- The point number determines the die:
  1. d4
  2. d6
  3. d8
  4. d10
  5. d12

## Attribute Checks

- GM sets a required number to meet (a.k.a the Difficulty Class, or DC)
- Roll two of the given attribute's die, result = total
- Far below the DC = unfavorable or unpredictable outcome
- At or above DC = favorable outcome
- Far above the DC = very favorable outcome

# Vitality - Health & Resolve

- A character's Health and Resolve are their **Vitality** stats
- They represent physical and mental wellness respectively
- Max health = **dice face total** of Strength + Mobility
- Max resolve = **point total** of Sense + Intellect + Wit
- Example:
  - If you have 5 points in Strength (d12) and 4 points in Mobility (d10), your max health is 12 + 10 = 22
  - If you have 3 points in Sense, 4 points in Intellect, and 2 points in Wit, your max resolve is 3 + 4 + 2 = 9
- When at zero:
  - In combat, you cannot take turns
  - Out of combat, all of your rolls have a snag dice
- Optionally, apply a player condition as appropriate
  - Example:
    - a punch brings a player down to 0 health, they would be unconscious
    - a player runs out of resolve while trying to impress others with aspect art, they might feel ashamed or embarrassed
- Player death is an optional mechanic, apply if desired and where it makes sense

# Modifier Dice

- 1d6s added to a roll in certain situations
- Boost dice add to the roll, snag dice subtract from the roll
- Snag dice cannot reduce the roll below 1

# Fortune Dice

- 1d100 rolled to decide things outside of the player's control, examples:
  - item availability
  - how fast a building crumbles
  - whether you get struck by lightning

# Actions

- Main way of interacting with things in the game
- Dice is rolled via the appropriate [[#Attributes\|attribute]] to determine the outcome

## Push Yourself

- After making a roll, you can spend 2 resolve to **push yourself**:
- Reroll, you _must_ use the new number
- Stakes increase, and the punishment for failure increases

## Assist

- You can spend 1 resolve to give a boost die to an ally's roll
- Need to narratively describe how you're helping them

## Rest

- Regain 1 resolve per hour of resting

## Attack

- A special type of [[#Actions\|action]] which deals damage to another character
- Roll the appropriate attribute or aspect to determine how much health the defender loses
- Character may defend or evade
- If their evasion is higher than the roll, they take no damage
- Otherwise, subtract their defense from the roll

## Basic Actions

TODO: list basic actions, which are example presets of common actions characters might do

# Positioning & Distance

- Characters positioned on 2D grid
- Grid cells are called **areas**
- Multiple characters can occupy the same area
- Adjacent - area next to yours
- Nearby - adjacent or in the same area as yours
- Every area is a square meter
- Distances are only considered in cardinal directions, not diagonally, a.k.a via [Manhattan distance](https://simple.wikipedia.org/wiki/Manhattan_distance)
- An area of size X is a square X meters wide

# Combat

- Begins when one party acts adversarially towards another
- Ends when no one wants to fight anymore

## Teams

- Teams in combat are groups who fight for each other
- (usually you vs. the enemies, but there may be third parties)
- All members of a team are allies to each other
- Members not in the same team are either enemies or neutral, depending on circumstances
- Characters can potentially be members of more than one team

## Combat Flow

- Combat is organized in _rounds_ and _turns_
- Everyone has one turn per round
- New round starts after everyone's taken their turn

## Turn Order

- Turns go team by team
  - e.g. Team A takes all their turns, then Team B
- Highest mobility goes first, then lowest
  - In socially-focused combat situations, go by wit instead
- On ties, players can just decide who goes first, or roll to break the tie

## Turn Actions

- Characters get 1 action during their turn
- They can spend 1 resolve for an additional action
- They get 1 reaction out of their turn, to act in response to another action

# Wealth

- instead of coin amounts, put items and characters in wealth brackets
- items in each tier are ~10x more expensive than the previous
- purchase item in current tier: go down two tiers
- purchase item one tier down, go down one tier
- everything two tiers down and lower is free
- can move up tiers through various means of gaining wealth:
- selling stuff
- completing a job for someone
- robbing a bank
- if players buy a lot of shit in lower tiers, handle this at DM's discretion
  | Tier | Occupations | Greatest Expense |
  |:----------------------|:------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|
  | 1. Homeless | Beggar, Thief | Trash, meal scraps, used and torn clothing |
  | 2. Impoverished | Cave Miner, Prostitute, Unemployed Artist / Performer | Common food or drink, night at a cheap inn, used clothing, sturdy rope, common raw materials |
  | 3. Lower Class | Store Clerk, Transport, Drifter | Expensive food or drink, unreliable tools, light armor, entry to a club, new everyday clothes, ferry ride, uncommon raw materials |
  | 4. Lower Middle Class | Protector, Farmer, Fisher, Smith, Artist / Performer | Reliable tools, apartment for one, a small pet, camping gear, _fresh_ clothes, rare materials, common artifacts |
  | 5. Middle Class | Teacher, Business Owner, Construction Worker, Tailor | Powerful tools, apartment for a few, a large or uncommon pet, strong armor, rare artifacts |
  | 6. Upper Middle Class | Master Craftsperson, Researcher | Nice house, bodyguard, luxury transport, established business, extravagant clothes |
  | 7. Upper Class | Politician, City Knight, Large Business Owner | A mansion, hired assassins, very rare artifacts |
  | 8. Celebrity | Landlord, Famous Performer | Land ownership, political leverage, personal chef, personal maid |
  | 9. Billionaire | Dictator, Monopolist | Business aquisition |

# Date & Time

- Days are divided into Daytime, Evening, and Nighttime
- Advance time as one sees fit

# The World of Eisenwald

- Looks and feels like a modern fantasy world
  - architecture and culture much like our own, with a slight twist of fantasy
  - common attire looks much like streetwear: loose, stylish, colorful, showy outfits
- Eisenkind: people who are almost entirely human, but with features of animals
- Aspect Art: the ability to manipulate various Aspects of nature, inherent to all Eisenkind

# Races of Eisenkind

Along with one or more common features of their race, Eisenkind will often exhibit pointed elf-like ears, and in rare cases, eyes with a subtle glow that brighten with the intensity of their emotions.

| Name      | Traits                                                                                   | Abilities                                                                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aquilian  | Bird-like: feathered wings and tail, additional feathers elsewhere                       | Flight - Double your movement when using Fly.<br>One with the Wind - You are immune to damage from wind.                                                                                                                                           |
| Arctana   | Bear-like: round fuzzy ears, small round tail                                            | Natural Intellect - Your Intellect rolls have +1 boost die.<br>Resourceful - You have one extra action point.                                                                                                                                      |
| Cetacian  | Fish-like: webbed head fins, tail like a dolphin or whale, dorsal fin, patches of scales | Aquatic Affinity - Double your movement when using Swim.<br>Sensory Superiority - Your Sense rolls have +1 boost die.                                                                                                                              |
| Felirian  | Like cats and other felines: small pointed ears, slender fuzzy tail, claws               | Slippery - You have 3 extra evasion when attacked.<br>Restful - You gain an extra 1d4 resolve when resting.                                                                                                                                        |
| Lagorei   | Rabbit-like: VERY tall ears, stubby tail                                                 | Unwavering Kick - You can only use your feet for Strike actions, and you roll with +1 boost die.<br>Leap of Confidence - Spend 1 resolve to leap: double your movement, you are in the air while moving, and you can only move in a straight line. |
| Macridian | Kangaroo-like: talk pointed ears, long fuzzed tail that's thicker at the base, a pouch   | Natural Roamer - You don't take travel fatigue.<br>Fury from Down Under - When pushing yourself, add one extra boost die.                                                                                                                          |
| Marenti   | Mouse-like: large round flat ears, a long thin tail                                      | Quiet as a Mouse - Sneak rolls have +1 boost die.<br>Naturally Swift - You have 5 extra meters of movement.                                                                                                                                        |
| Mendix    | Bug-like: clear glassy wings like a butterfly, antennas coming out their head            |                                                                                                                                                                                                                                                    |
| Myrmadon  | Pangolin-like: covered in patches of hard scales on their back, arms, and shoulders      | Natural Strength - All strike rolls have +1 boost dice.<br>Protective Scales - Your max health is increased by 10.                                                                                                                                 |
| Pyra      | Draconic: large wings, long thick tail with scales, horns                                | Tail Whip - Use your tail to knock nearby characters prone.<br>Descendant of the Caldera - You are immune to damage from fire and heat.                                                                                                            |
| Renari    | Like foxes, dogs, and other canines: pointed fuzzy or floppy ears, long fluffy tail      | Sneak Attack - Spend one resolve to double your attack roll.<br>Adaptable - Before the start of combat, you may swap two of your attribute dice until the end of combat.                                                                           |
| Sylvanix  | Deer-like: appleseed shaped fuzzy ears, antlers (even on females), small stubby tail     | Resolute - Your max resolve is increased by 5.<br>Nimble - Your Mobility rolls have +1 boost die.                                                                                                                                                  |
| Umbraleth | Demonic: horns, long thin spaded tail, bat wings, pointed ears                           | Devilish Charm - Your Wit rolls have +1 boost die.<br>Descendant of Darkness - All of your attribute rolls have +1 boost die at night.                                                                                                             |

# Aspects

- Elements of nature which Eisenkind can manipulate to various ends
- The technique is called **Aspect Art**
- Commonplace in society: used for starting campfires, heating tea, eased travel, construction, etc.
- The usages of aspect art are limited only by the character's imagination :)
  | Aspect | Domain |
  |:---------|:----------------------------------------------------|
  | Fire | flame, heat, and lightning |
  | Water | water, air moisture, ice, and cold |
  | Earth | rocks, metals, inorganic natural solids |
  | Light | healing, buffs, physical light |
  | Darkness | illusions, warping reality, debuffs, snuffing light |

## Aspect Art Actions

- Character declares how they want to use an aspect
- Make a roll to determine its effectiveness
- Any aspect art action can be made as an [[#Attacks\|attack]] on another character

# Locations

- Rosenfeld
  - large populous diverse bustling metropolis
  - known informally as Eisenwald's capital
  - center of innovation, prosperity, opportunity
  - home to Rosenfeld Academy, Eisenwald's most popular academy
- Azeurus
  - Coastal town
  - Eisenwald's second largest city
  - Longest standing settlement with a rich history
  - Makes most money from seafood trades
  - High societal standards
  - Mostly conservative
  - Mostly Cetacian and water users
- Aeropolis
  - floating city
  - lighthearted, whimsical culture
  - home to most multi-regional sporting events
  - popular tourist attraction
  - mostly Aquilians and wind users
- Whisperwood Forest
  - big expansive forest shrouded in myth and mystery
  - many people have mysteriously gone missing
  - lots of strange reported sightings
  - despite all that, paths run through small pockets of civilization with their own histories and cultures
  - many of them are known to be hostile to outsiders
- The Caldera
  - large volcanic region
  - constantly hot, constantly erupting
  - settlements exist in less active areas, but no place is completely without risk of magma explosions
  - people here love the thrill of the danger, and even find the heat comforting
  - mostly Pyra and Umbraleth
- The Undergrowth
  - networks of underground tunnels running through various cities
  - center of crime and secrets
  - considered most dangerous place to be
  - source of many precious metals, gemstones, and drugs
  - prone to sudden floods and cave-ins
  - mostly Umbraleth and Myrnadon
- The Frostwilds
  - evergreen forest in the far north
  - mostly uninhabited, but people here enjoy the piece and quiet
  - chilly during the summer, bitterly freezing and snowy during the winter
  - mostly Renari and Arctana
- The Outlands
  - all uninhabited areas of Eisenwald
  - dark, thick forests
  - wide and colorful variety of wildlife and fauna
  - various creatures in various combinations of big, small, friendly, or ferocious
  - mostly an uncharted mystery that many Eisenkind are taught to avoid
  - constant threat to those who live near

# Factions

- various schools of thought on how to treat the Outlands
- Protectionists: don't enter, bolster defenses, prioritize lives
- Imperialists: the Outlands are a resource waiting to be profited from
- Cohabitationists: Outland life and Eisenkind should live together in harmony
- Singularists: all Outland life should be eradicated, even at the cost of Eisenkind lives
- Naturalists: Eisenkind wrongfully invaded and stole the land from the Outlanders, and they have the right to take it back, by force if necessary

# Currency

- common currency is the Rosenfeld note
- 1 note ≈ 1 USD

# Calendar

- four months of 24 days for a 96 day year
- Sunburst, Harvest, Snowfall, Blossom
- each month is named after its season

# Astronomy

- two moons
- smaller one is Aurora, faster cycle, visible more often
- bigger one is Nocturne, slower cycle, visible less often
- Sun changes color depending on the season

# Education

- Academies are the primary schooling locations
- many of them all across Eisenwald
- most are open to all ages, no grade separation
- mainly teaching practical life skills and aspect art, alongside reading, writing, and math

# Technology

- no tech at or after industrial revolution, e.g. no steam engines, light bulbs, telephones, or radio
- flexible; bend this rule where it makes sense
- aspect art absolved the need for much of it

# Items

> [!warning]
> work in progress

- Item properties: - Consumable X: can be used X times before the item extinguishes - Wearable: can be worn on a character for a persistent effect - Durability X: Has X ticks of durability. Whenever you use this item, roll a 1d12. On a 1, the item loses one tick, and becomes unusable at 0.
  | Item | Categories | Properties | Wealth Tier | Effect |
  |:----------------------------------|:------------|:---------------|:------------|:-----------------------------------------------------------------------------------------------------------|
  | Filling Snack | | | 2 | Restore 3d4 health |
  | Uncooked Snack | | | 1 | Restore 1d4 health, lose 1d4 resolveWhen cooked, becomes a filling snack |
  | Haptonite | | | | |
  | Glow | | | | |
  | Handcuffs | | | | |
  | Rope | | | | |
  | Tinderbox | | | | |
  | Gemstone (?) | | | | |
  | Fishing Rod | | | | |
  | Common Shield | | | | |
  | Medicinal Herbs | | | | |
  | Medkit | | | | |
  | | | | | |
  | Artifact of Teleportation | Accessory | Durability 20 | 8 | Squeeze and think of a location to teleport yourself and allies there, with a large margin for error. |
  | Artifact of Outlandian Strength | Accessory | Wearable | | Increase your max health by 20. |
  | Artifact of Immaculate Appearance | Accessory | Wearable | | Roll Wit with an extra die. |
  | Artifact of Persistence | Accessory | Wearable | | Spend 1d4 to reroll any roll. |
  | Artifact of Focus | Accessory | Wearable | | Increase your max resolve by 30. |
  | Charming Violet Boutonnière | Accessory | Wearable | | Characters with wit lower than yours cannot damage you. |
  | Quill of Evaporation | Accessory | Wearable | | Resist all water damage. |
  | Aviator's Goggles | Accessory | Wearable | | +1 to Sense rolls while in the air. |
  | Energy Drink | Beverage | Consumable 5 | 2 | +1 boost die to next Mobility roll |
  | Protein Drink | Beverage | Consumable 5 | 2 | +1 boost die to next Strength roll |
  | Calming Tea | Beverage | Consumable 5 | 2 | +1 boost die to next Sense roll |
  | Stylish Outfit | Clothing | Wearable | 6 | +1 boost die to Wit rolls |
  | Comfy Coat | Clothing | Wearable | 4 | Immune to negative effects from cold.When you take damage, you may reduce it by 1d4. |
  | Igneous Vest | Clothing | Wearable | | When taking fire damage, divide it by two, rounded down. |
  | Lightening Garb | Clothing | Wearable | | +1 boost die to Mobility rolls. |
  | Spider Bat Egg | Collectible | | 6 | |
  | Moonbeast Venison | Food | Consumable 1 | 3 | Uncooked: restore 1d4 health, lose 1d4 resolveCooked: restore 3d4 health |
  | Crumpet | Food | Consumable 1 | 2 | +1 boost die to next Intellect roll |
  | Spider Bat Silk | Material | Consumable 1 | 6 | |
  | Spider Bat Hide | Material | Consumable 1 | 6 | |
  | Spider Bat Venom | Material | Consumable 1 | 6 | |
  | Moonbeast Horn | Material | Durability 3 | 4 | +1 boost die to attacks made with this item. |
  | Binoculars | Tool | Wearable | 5 | +1 boost die to sighted actions |
  | Sharp Instrument | Tool | Durability 20 | 4 | +2 boost die on attacks made with this weapon |
  | Blunt Object | Tool | Durability 20 | 4 | +2 boost dice on attacks made with this weapon |
  | Umbrella | Tool | Wearable | 4 | Avoid negative effects that would come from getting drenched by rain, or any other falling source of water |
  | Enchanted Whisperwood Bow | Weapon | Durability 100 | | +3 boost dice to attacks made with this weapon. |
  | Sword of Champions | Weapon | Durability 100 | | +3 boost dice to attacks made with this weapon. |
  | Crossbow | Weapon | Durability 20 | | +1 boost die to attacks made with this item. |
