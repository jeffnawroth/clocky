# Store Screenshots Checklist

Screenshots for the Raycast Store listing. Not automatable (native macOS app) — capture manually with `ray develop` running and some example data (a mix of closed and open sessions/pauses across a few days) already in local storage.

## Seeding demo data (optional, dev-only)

`src/seed-demo-data.tsx` (untracked, not committed) populates this extension's
own local storage with realistic demo data — untested against the live
extension, verify the first render before relying on it. To use it:

1. Add this entry to `package.json`'s `"commands"` array:
   ```json
   {
     "name": "seed-demo-data",
     "title": "Seed Demo Data (Dev Only)",
     "subtitle": "Populates local storage with demo data for screenshots",
     "description": "Temporary dev command. Not shipped.",
     "mode": "no-view"
   }
   ```
2. Run `ray develop` (or reload the running dev session) and run "Seed Demo
   Data (Dev Only)" from Raycast once. Best run Tue-Fri — see the comment at
   the top of the script for why.
3. Capture the screenshots below.
4. Delete `src/seed-demo-data.tsx` and the temporary `commands` entry from
   `package.json` — neither must ship.

## Screenshots (4x, PNG, 2000x1250px / 16:10, named `clocky-1.png`...`clocky-4.png`)

- [ ] `clocky-1.png` — `today` — daily overview with at least one completed and one active session
- [ ] `clocky-2.png` — `week` — weekly summary with a mix of on-target and over/under days
- [ ] `clocky-3.png` — `status` (menu bar) — showing the "paused" state with a live delta
- [ ] `clocky-4.png` — `history` ("Adjust Entries") — list of grouped sessions, one with pauses

Per [Raycast's requirements](https://developers.raycast.com/basics/prepare-an-extension-for-store#screenshots): PNG, 2000x1250px (16:10), 3-6 screenshots, consistent background/theme across all of them. Raycast 1.37.0+ has a built-in Window Capture tool (Advanced Preferences) that saves them in the correct format automatically.

Once all 4 PNGs exist in `metadata/`, delete this file — it's a planning
checklist, not a Raycast-required file, and shouldn't ship in the submitted
repo.
