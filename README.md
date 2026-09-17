# Yahtzee

A polished, browser-based Yahtzee game with solo play and a local computer opponent. It runs entirely on the client, so it is fast to load, easy to host, and requires no account or backend.

## Features

- Solo and player-versus-computer modes
- Complete 13-round Yahtzee scoring
- Dice selection, rerolls, upper-section bonus, and Yahtzee bonuses
- Computer turns with visible rolls, held dice, and scoring decisions
- Responsive layout for desktop and mobile screens
- Smooth transitions with reduced-motion support
- No build step or server-side dependencies

## Play locally

Open `index.html` in a modern browser. The game is static and can also be deployed directly with GitHub Pages or any static hosting provider.

## How to play

1. Choose `Solo game` or `Play computer`.
2. Roll up to three times per round.
3. Click dice to move them into the holding tray.
4. Choose an available score category.
5. Complete all 13 rounds and finish with the highest score.

## Technology

Built with semantic HTML, Sass/CSS, and vanilla JavaScript. Hammer.js is included for touch gestures on the score and rules panels.

## About

Yahtzee is a lightweight open-source browser game focused on tactile dice interactions, clear scoring, and a quick game loop. The project is intentionally framework-free so it can be understood, customized, and published as a static site with minimal setup.

## License notes

The project includes third-party browser libraries. Their original license and attribution notices remain in the source files.

[Yahtzee rules](https://en.wikipedia.org/wiki/Yahtzee#Rules)

