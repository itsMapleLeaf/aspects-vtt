# Tasks

## mvp

- [x] add convex
- [x] set username
- [x] dice rolls
- character sheets
  - [x] name
  - [x] text fields
  - [x] image
  - [x] number fields
  - [x] multiline text fields
  - [x] dice fields
  - [x] createdBy (in database)
  - [x] buttons next to dice fields to roll them, automatically includes fatigue
- token grid
  - [x] infinite grid
  - [x] left-click and drag to move viewport
  - [x] add a `mapTokens` table to the database
  - [x] add token properties to characters
  - [x] rendering database tokens
  - [x] rendering character tokens
  - [x] drag token to move it
  - [x] add token from character
  - [x] remove token
  - [x] configurable token-level health and fatigue
  - [x] link tokens to characters - each token uses the character's values as fallbacks, but can be set individually
  - [x] button to set background image from upload
  - [x] hide menu while dragging token
  - [x] hide token tags unless selected

## priority

- [x] simplify images
- [x] hardcode the character data schema
- [x] make characters and tokens equivalent
- [ ] token deselection to hide side panel
- room ownership
  - [x] set room owner on creation
  - only room owner can:
    - [x] delete room
    - [ ] change room background
    - [x] add or remove characters
    - [ ] show/hide tokens
- players
  - [x] add `players` property to room
  - [x] when a player joins a room, add their user ID to the list
  - [x] owner-only dropdown to assign character to player
  - [x] player only sees their own character
  - [x] player _cannot_ add or remove their own token
  - [x] player can only control their own token
  - [x] notes field
- tokens
  - [x] fix name tag blocking clicks
  - [ ] non-character tokens
- map
  - [ ] conform to background image size
  - [ ] configure cell size in pixels
  - [ ] zooming
- characters
  - [x] pronouns field
  - [ ] duplicate button

## features

- character sheets
  - [ ] open in a pop-out window
- token grid
  - [ ] measuring distance
  - [ ] draw lines
  - [ ] draw squares
  - [ ] add new token to center of screen and/or click to place token
  - [ ] player cursors
  - [ ] custom token sizes
  - [ ] items per token
  - [ ] set background from drag and drop
  - [x] button to reset viewport
  - [x] press delete to remove selected token
- [x] move health & fatigue to tokens

## ideas

- a command or button to bring up info about a specific game topic, like skills or races
- move the game doc content entirely to the website
- some kind of map grid with tokens
- drag and drop to change room background and/or map
- music via YouTube embeds
- character sheets with arbitrary counters and field
- NPC generation and tracking
- buttons on character sheets to make specific rolls for skills and other actions
- custom dice macros?
- export and import individual characters as json
- button to randomize character names
- chat
