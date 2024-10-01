## Authentication

- [ ] Discord login
- [x] (mvp) Login / Signup

## Battlemap

- [ ] Distance measurement on token drag
- [ ] Grid lines
- [x] (mvp) Multi-select
- [x] (mvp) Multi-select drag

## Character Card

- [ ] Order alphabetically (?)
- [ ] Manage conditions
- [x] (mvp) Edit button should open character editor
- [x] (mvp) Use health/resolve from DB
- [x] (mvp) Click attribute button to roll die, creates a chat message
- [x] (mvp) Add popover to add boost/snag dice
- [x] Search
- [x] Collapsible character cards

## Character Editor

- [ ] Add a help button to show a popover/modal with a table of wealth tiers
- [ ] Manual health/resolve modifiers
- [ ] Show traits on each combobox race option
- [ ] List race skills
- [ ] Image uploader preview + fallback to current image
- [ ] Styled tabs
- [ ] (Admin) Add a randomize button beside each input to randomize that one thing
- [ ] Dirty checks to avoid unneeded saves + confirm dialog?
- [x] (mvp) Character creation
- [x] (mvp) Character deletion
- [x] (mvp) Player assignment (dropdown on character cards and/or editor)

### Character Editor: Profile

- [x] (mvp) Name
- [x] (mvp) Pronouns
- [x] (mvp) Race
- [x] (mvp) Image
- [x] (mvp) Health / resolve
- [x] (mvp) Race-dependent bonuses
- [x] (mvp) Wealth
- [x] (mvp) Notes
- [x] (mvp) Attributes

### Character Editor: Inventory

- [x] (mvp) Adding items
- [x] (mvp) Quantity
- [x] (mvp) Delete

### Character Editor: Skills

- [ ] Filter by aspect
- [ ] Tabs: available, learned, all
- [ ] Persist filters
- [ ] (stretch) Character exp override
- [ ] (stretch) Click required skill to highlight(?) and scroll to it in the list
- [ ] On player side, cost/req validation
- [x] (mvp) Adding skills

## Character Tokens

- [ ] Condition badges
- [x] (mvp) Vitals fields
- [x] (mvp) Multi-character combat toggle

## Character Menu

- [ ] Manage conditions
- [x] (mvp) Vitals fields
- [x] (mvp) Multi-character combat toggle
- [x] Edit button should open editor

## Combat Turn Tracker

- [ ] Track action, extra action, and push
- [x] (mvp) Empty state with start button
- [x] (mvp) Active combat state
- [x] (mvp) Show participants' name, avatar, and initiative (mobility)
- [x] (mvp) Sort participants by mobility
- [x] (mvp) Track current member
- [x] (mvp) Next/prev buttons
- [x] (mvp) Click to set current member

## Messages

- [ ] Relative timestamp should show exact date on hover
- [ ] Show applicable skills + effects on messages
- [ ] Increase font sizes?
- [ ] Roll visibility (self, gm, public)
- [ ] Show some new message indicator if the message panel is not visible
- [x] (mvp) Chatbox (manual messages/rolls)
- [x] (mvp) Message content
- [x] (mvp) Dice rolls
- [x] (mvp) Author
- [x] (mvp) Timestamp
- [x] (mvp) Bottom scroll
- [x] Character mentions in messages

## Scene Management (Admin)

- [ ] Multiple scene images
  - [ ] Per time of day images?
- [x] (mvp) Properties: name, grid size, background
- [x] (mvp) Create scenes
- [x] (mvp) List scenes
- [x] (mvp) Update scenes
- [x] (mvp) Delete scenes

## Room Management

- [ ] Some "add all players to scene" button
- [ ] Create room
- [ ] List rooms
- [ ] Edit room
- [ ] Delete room
- [ ] Room experience tracking
- [x] (mvp) Room Item Manager Panel

## Attack Modal

- [ ] Implement attack modal functionality

## Attribute Buttons

- [x] (mvp) Show attribute die below each button
- [x] (mvp) Race-dependent bonuses

## Actions Panel

- [ ] Action descriptions
- [ ] Strike
- [ ] Rest
- [ ] Swim
- [ ] Dig
- [ ] Fly
- [ ] Sneak
- [ ] Jump
- [ ] Aspect Art
  - [ ] Optional attack target

## UI Enhancements

- [ ] Mobile responsive sidebars
- [ ] Sidebar collapse buttons
- [ ] (stretch) Resizable panels

## Miscellaneous

- [ ] (mvp) Consider allowing players to add items
- [ ] Conditions
- [ ] Game time tracking
- [ ] Weather
- [ ] Character tokens: Fallback character images
- [ ] Notes - big textarea persisted database-side per player

## Bug Fixes

- [ ] Character list has a horizontal scrollbar
- [ ] Character tokens sometimes don't snap
- [ ] Login form: Show the "passwords don't match" error under "Confirm Password"
- [x] (mvp) Players can't see battlemap
- [x] (mvp) Attribute roll modal should go away when you click roll
- [x] (mvp) Push yourself does not subtract resolve
- [x] (mvp) Attribute buttons currently broken
- [x] (mvp) Names are public on dice roll messages
