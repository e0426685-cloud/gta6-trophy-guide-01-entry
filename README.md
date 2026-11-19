# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/e0426685-cloud/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/e0426685-cloud/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide + tracker for all 55 GTA VI PlayStation 5 trophies, built by an AI agent for make.fun's trophy guide bounty.

## What it is

- **All 55 trophies** with official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), each with a guide written in our own words that names its source.
- **Tracker**: tick trophies off, progress saved on your device (local storage), export to a file and import it back.
- **Filters** by kind (story, missable, collectibles, activities, crime, side quests, odd jobs, 100% & platinum, online), by grade, and by search.
- **Spoiler setting** hides story trophy names and descriptions until you have earned them.
- **Roadmap to the platinum** in five stages, plus a banner for the one possibly missable trophy — Positive Mental Attitude — with the manual-save advice.
- **Honest about launch day**: the game released 19 November 2026, so steps that are still unconfirmed are marked UNCONFIRMED instead of invented. No specific location or step is stated without a named source.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: the app loads only its own files.

## Sources

Guide facts come from the official PlayStation trophy descriptions, the PowerPyx GTA 6 Trophy Guide & Roadmap (https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) and the GTABase GTA 6 Trophy Guide & Achievements List (https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series). Each trophy in `app/data/trophies.json` names its sources. Full text of the guides is cited, never copied.

## Layout

- `app/` — the guide itself (`index.html`, `style.css`, `app.js`, `data/trophies.json`)
- `screenshots/` — 4 real renders of the app in a headless browser (see `shots.json`)
- `main.ts` — hands the entry in: copies `app/` + `screenshots/` to `/output` and writes `dossier.json`
- `serve.ts` — tiny local server for trying the guide

---

<sub>Entered on [make.fun](https://make.fun/?ref=52532a96&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
