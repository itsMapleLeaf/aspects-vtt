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

## features

- [ ] toggleable side panels
- room ownership
  - [ ] set room owner on creation
  - only room owner can:
    - [ ] delete room
    - [ ] change room background
    - [ ] add, remove, show, or hide characters
    - [ ] add, remove, show, or hide tokens
- room players
  - [ ] add player model to database
  - [ ] when a player joins a room, add them to the room's player list
- character ownership
  - [ ] dropdown to assign character to player
- character sheets
  - [ ] open in a pop-out window
- token grid
  - [x] button to reset viewport
  - [ ] add new token to center of screen and/or click to place token
  - [ ] configure background size in cell width
  - [ ] measuring distance
  - [ ] draw lines
  - [ ] draw squares
  - [ ] player cursors
  - [ ] custom token sizes
  - [ ] zooming
  - [ ] items per token
  - [ ] set background from drag and drop
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
