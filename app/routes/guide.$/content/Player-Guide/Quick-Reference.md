# Quick Reference

# Dice Rolls

Every dice roll makes use of a die from the dice sequence:

d4 → d6 → d8 → d12 → d20

The result of your roll is the **effect**.

## Modifier Dice

d4 dice which modify the effect by their face value

- Boost: adds to the effect
- Snag: subtracts from the effect

Any roll can be modified.

Any roll can have any number of boost or snag dice.

# Actions

You can perform _any_ action (within reason), and DM chooses the best attribute for the action, and whether it requires a dice roll at all.

Dice rolls are required for anything your character wants to do that may or may not succeed. The required effect depends on the difficulty of the task:

- Thoughtless: 1-4
- Simple: 5-8
- Tedious: 9-12
- Frustrating: 13-16
- Harrowing: 17-20
- Draconic: 21+

[](General-Skills/General-Skills.md) - predetermined actions that can be used by everyone

[Aspect Skills](Aspects.md) - skills revolving around aspect art, which require learning before using it

# Attributes

Attribute rolls are always made with two dice.

**Effect** - The result of a dice roll

**Value** - The side count of an attribute die

**Level** - The number in the dice sequence of the die

Example: You have a d12 in [Sense](Attributes/Attributes/Sense.md). Your sense **value** is 12, and your sense **level** is 4. When you roll sense, you get an 8 and a 9. The **effect** of that roll is 17.

## Strength

Physical force and resilience.

Examples: punching someone, lifting something heavy, breaking a window, or resisting the effects of a harmful substance.

## Sense

Perception, environmental awareness, focus, mental resilience.

Examples: looking for a needle in a haystack, sensing someone sneaking up on you, or feeling if it’ll rain.

## Mobility

Speed, agility, reflexes, reaction time.

Examples: dodging an attack, making a huge leap of faith, and briskly climbing, running, or swimming.

## Intellect

Book knowledge, problem-solving, and memory.

Examples: Recalling and applying studied information, using technology, building contraptions, and solving puzzles.

## Wit

Social aptitude, cunning, intimidation.

Examples: telling a convincing lie, getting on someone's good side, introspecting a person's hidden feelings, and reading the mood of the room.

# Aspects

Aspects are the elements to which eisenkind can manipulate to various ends, an act referred to as **aspect art**.

## Fire

Uses: dealing direct damage, breaking things, burning things

Drawbacks: self-inflicted damage

## Water

Uses: environmental augmentation, for purposes of protecting allies or impairing enemies

Drawbacks: effects are indiscriminate and require strategic positioning

## Wind

Uses: heightening movement - reaching destinations more quickly, escaping danger, or getting to hard-to-reach places

Drawbacks: randomness 🎲

## Light

Uses: healing and strengthening others

Drawbacks: taking lots of fatigue

## Darkness

Uses: confusion, illusions, weakening others

Drawbacks: effects are often non-immediate and/or delayed

# Stress

Damage represents physical stress, and fatigue represents mental stress.

Resting in-game takes a full day tick and heals 2d6 fatigue.

## Damage

Damage Threshold = Strength + Mobility

Exceeding damage threshold → Incapacitated - all physical rolls are 1d4

## Fatigue

Fatigue Threshold = Sense + Intellect + Wit

Exceeding fatigue threshold → Exhausted - all mental rolls are 1d4

# Distance & Movement

- The game plays on a 2D square grid
- Each square is a square meter
- Distances are measured in [**Manhattan distance**](https://simple.wikipedia.org/wiki/Manhattan_distance), in other words, the horizontal distance plus the vertical distance. **I**f you move 2 meters left and 2 meters up, you are 4 meters from where you started.
- Area effects are squares, where the size is the width and height of the square. Unless stated otherwise, the square is centered on whoever or whatever the effect originated from.

# Combat

Combat is organized in **rounds**.

One round lasts for 5-10 seconds in-game.

To determine initiative order, roll [Mobility](Attributes/Attributes/Mobility.md), and go from highest to lowest. Different scenarios may call for a different attribute.

During a round, each player acts in initiative order.

On your turn:

- You can make one action
- You can take 1d4 fatigue to make an additional action, once per turn
- You can move meters equal to your mobility

Examples of actions:

- Using [Strike](General-Skills/General-Skills/Strike.md) to punch someone
- Perform first aid with [Healing Light](Aspects/Aspect-Skills-Table/Healing-Light.md)
- Using [Absolute Darkness](Aspects/Aspect-Skills-Table/Absolute-Darkness.md) to increase the tension 😈
- Deciphering an ancient book
- Disarming a trap so you don’t get crushed by the stone walls closing in on you :)

The GM may also let you do minor actions: something less impactful that doesn’t require a dice roll, and/or something you can offhandedly do alongside a normal action.

Examples of minor actions:

- Pulling out a weapon
- Taking off a heavy cloak
- Giving someone an item
- Alerting allies of danger or giving them other important information

# Using Aspect Skills

1. Pick an aspect skill to use
2. Choose a level from 1 to 5 (max is your highest skill tier)
3. Take corresponding fatigue
   1. Pick the highest fatigue cost of any relevant metrics, by face count then by dice count (e.g. 2d20 > 4d12)
4. Make relevant dice rolls using the aspect’s linked attribute
   - [Fire](Aspects/Aspects/Fire.md) → [Strength](Attributes/Attributes/Strength.md)
   - [Water](Aspects/Aspects/Water.md) → [Sense](Attributes/Attributes/Sense.md)
   - [Wind](Aspects/Aspects/Wind.md) → [Mobility](Attributes/Attributes/Mobility.md)
   - [Light](Aspects/Aspects/Light.md) → [Intellect](Attributes/Attributes/Intellect.md)
   - [Darkness](Aspects/Aspects/Darkness.md) → [Wit](Attributes/Attributes/Wit.md)
5. Resolve effects

| Level         | 1    | 2    | 3     | 4     | 5     |
| ------------- | ---- | ---- | ----- | ----- | ----- |
| Fatigue Cost  | 1d6  | 2d6  | 3d6   | 4d6   | 5d6   |
| Distance      | ≤ 2m | ≤ 5m | ≤ 10m | ≤ 15m | ≤ 30m |
| Area Diameter | ≤ 3m | ≤ 5m | ≤ 8m  | ≤ 12m | ≤ 20m |
| Target Count  | ≤ 3  | ≤ 5  | ≤ 8   | ≤ 12  | ≤ 20  |
| Boost Dice    | 0    | +1   | +2    | +3    | +4    |

| Fatigue Cost | 1d6                            | 2d6                                  | 3d6                               | 2d20                                | 3d20       |
| ------------ | ------------------------------ | ------------------------------------ | --------------------------------- | ----------------------------------- | ---------- |
| Duration     | A few seconds / 1 combat round | 30 seconds / 5 combat rounds or less | An hour / until the end of combat | Until the next scene or time of day | A full day |

<aside>
ℹ️ If an ability or effect says to apply a dice roll amount to multiple targets, instead of rolling per target, roll **once**, then apply the result.

</aside>

# Learning New Aspect Skills / Spending Experience

Aspect skill cost: 10 \* tier + aspect number

|        | First Aspect | Second Aspect | Third Aspect | Fourth Aspect | Fifth Aspect |
| ------ | ------------ | ------------- | ------------ | ------------- | ------------ |
| Tier 1 | 10           | 15            | 20           | 25            | 30           |
| Tier 2 | 20           | 25            | 30           | 35            | 40           |
| Tier 3 | 30           | 35            | 40           | 45            | 50           |
| Tier 4 | 40           | 45            | 50           | 55            | 60           |
| Tier 5 | 50           | 55            | 60           | 65            | 70           |
