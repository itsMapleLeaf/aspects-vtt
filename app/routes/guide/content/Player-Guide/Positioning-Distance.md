# Positioning & Distance

Characters are positioned on a 2D grid, where each grid space, or **area**, represents a square meter.

You are considered **nearby** to another character if you occupy the same area or the area adjacent to them.

You must be nearby a target to physically interact with it, e.g. using [Strike](General-Skills/General-Skills/Strike.md) or other touch-based actions.

Distances are only considered in cardinal directions, never diagonally. For example, if you move two meters forward and two meters left, your distance from the starting point is 4 meters. This is also called the [Manhattan distance](https://simple.wikipedia.org/wiki/Manhattan_distance).

Effects describing “areas of a size” define a square with that width and height.
