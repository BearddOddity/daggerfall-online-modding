# FIELD BUGS 2026-10-13 - two threads from the bug-reports channel

Two Discord threads from 2026-10-13, handed over as screenshots, read on the code as it stands at main's `00d4d202`.

| | Report | What it was | Done |
|---|---|---|---|
| 1 | "Pleading guilty not working" - "I'm stuck in a loop of being able to plead guilty or not guilty for a crime after I assassinated an NPC for a quest" (pepsiorcoke.) | the Crime tutorial page is pushed over the court's plea a beat after the court opens; the enhanced plea's buttons answered under it, its prison screen replaced the PAGE, and the answered plea stayed in the stack with live buttons - every press pleaded again | fixed (PLEA-LOOP) |
| 2 | "Morrowind assets Still missing" - "After update they seemed to work for a moment but now it stopped working again" (Odibatorasu "Spectre") | the thread after 12g's BATCH-SHUT (report 8 there): the Morrowind bodies gone again after the update carrying it | open - being read |

## PLEA-LOOP: the plea under the Crime page answers nothing (1)

`src/ui/windowStack.js` windowCovered; `src/ui/enhancedDialog.js` drawEnhancedChoice; `src/ui/enhancedDialogStyle.js`
(`.dlg-covered`); `src/ui/talkWindow.js` ChoiceWindow.input; `src/scenes/arrestFlow.js` step, release.

THE CHARGE IS THE WATCH'S, as REP1 built it. The quest's killing was a crime, the region's standing fell past -10, and a
guard who saw the player stopped a known criminal: "come quietly" is a Criminal Conspiracy, charged once, and the court
(`scenes/standingHost.js`). The screenshot's numbers (160 gold and 33 days, fifteen penalty units) put the standing in
the -20s. None of that is the loop.

FOUND. startCourtFlow opens the courtroom and pushes the plea over it, and the courtroom's constructor is the Crime
page's first use (TUT1, `noteFirstUse('crime')`): a beat later (SHOW_DELAY_MS) the page is pushed OVER the plea. The
keys reach the page alone - a host hands a key to its top window, DFU's law (UserInterfaceManager's TopWindow). On the
enhanced skin the plea is the keyed menu's DOM dialog (DLG2), and its buttons called the window's own `input(code)`
directly, wherever the window stood; its scrim, over the whole screen at z-index 38, took every click the page's "click
or press any key" asked for (the notice stack is pointer-transparent: a click that dismisses a box is the canvas's), so
for a mouse the plea's buttons were the only thing on screen that answered. Guilty, pressed under the page, pleaded.
The prison screen that answer opens comes through showOverlay - DFU's CloseWindow-then-Push, a one-level replacement of
the TOP - and the top was the page: the page was replaced, not the plea. The answered plea stayed in the stack under the
prison screen, painted every frame (the stack paints what its top covers, ROAD close-P), so its dialog was built again a
frame later with live buttons; the page, replaced unread, came back over the prison screen and held its countdown - the
screenshot's "7 days until freedom." is that held count, the label the covered prison screen still paints. Every press
pleaded again: the term halved, the fine taken again, and once the term reached nothing the release ran - four hours,
the grace, the reposition - as often as it was pressed, because a box answered twice and a step of a released trial
still acted. Reproduced through the real town host's stack, the real arrest flow and court, the real tutorial line and
page and the real keyed menu's DOM (a fake document): a covered Guilty took 160 gold to 80 and opened a 12-day term,
the next press 40 and 6, five more 2 gold and three releases.

FIXED, at each layer, each pinned against the others broken:

- THE STACK SAYS WHO IS COVERED. TopWindow is the only window that receives input. Every door in and out of a stack
  (push, pop, a replacement, keepOnly, the drain) records which stack holds a window, and `windowCovered(win)` answers:
  held, under another window. A window no stack holds (the boot menu's, chargen's) is nobody's to cover.
- A COVERED KEYED MENU TAKES NO POINTER AND ANSWERS NOTHING. Painted as the stack paints it, it wears `.dlg-covered`
  (`pointer-events: none`, which every node of the dialog inherits): a press falls through to the canvas, where the
  host hands it to the window on top - the page is put away by a click, as DFU's top window takes one, and G or N
  pressed under it does the same. The button asks the stack again at the press, so a frame's lag answers nothing.
- A BOX IS ANSWERED ONCE. `ChoiceWindow.input` returns on a done box - the occupant's half of THE SLOT IS EMPTIED BEFORE
  THE OCCUPANT IS TOLD (`Home.md`): a close dispatches once, however many doors call it.
- A RELEASED TRIAL IS OVER. ReleaseFromPrison is the court's last act (its CancelWindow, DaggerfallCourtWindow.cs:490);
  the trial's token stood on past it, so a step armed for a released trial still acted. `release()` marks the trial
  released and every step of it stands down. The token stays, so a load still takes the trial's last box down (AUDIT
  DISC28 AR-1's `abandon`).

The keys were never the hole: G under the page puts the page away and G again pleads once. A buttoned box
(`ui/messageBox.js`'s, DLG1) replays its press on the canvas, so its host already handed it to the top window; only
the keyed menu reached its window directly. `10-UI/Tutorials.md` carries the note.

`test/fb1013_plealoop.test.js` (4): the report's court through the real host, flow, page and dialog - covered, the plea
is painted, wears the class the composed sheet gives no pointer (and no `.dlg-` rule gives back), answers neither
button; the canvas click puts the page away and marks it read; uncovered, Guilty pleads once, the prison screen
replaces the plea, its buttons never come back, the term is served once and released once; the stack's answer through
every door; a keyed menu answered once by a key, a click and its rebuilt button; a released trial's two plea steps,
reached past the box, act on nothing.

NOT SEEN. Whether the reporter answered with the mouse - the loop needs it, and the screenshot's buttons say the
enhanced skin. Asked to try the court again after the update.

## THE FOUR HOSTS

- PLEA-LOOP: one module is every host's stack (`ui/windowStack.js` - townTalk's for world.js and exterior.js,
  worldModes.js's interior stack, dungeonContext.js's; interior.js, the `?interior` bench, builds its own from it), and
  the keyed menu asks whichever holds its window. The court itself is the street hosts' (world.js, exterior.js).

## Pins

`test/fb1013_plealoop.test.js` (4). `tools/mutants/fieldbugs1013.json`: 12, all dead (PLEA-LOOP 12).
`tools/mutants/auditdisc28_arrest.json`'s AR1-an-abandoned-trial-still-steps re-aimed by content at the step's new
guard, dead.
