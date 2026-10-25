# Lines

An open-source browser version of **Color Lines**, also known as **Lines98**: move balls on a 9×9 board to line up five or more of the same color. It is becoming an installable web app that works offline and keeps your game on your device, with no backend.

Work in progress: https://lines.bortnik.org shows a placeholder for now.

## Requirements

Node.js 22 or newer. Builds that can't run TypeScript files directly, such as Ubuntu's `nodejs` package, work too.

## Build and run locally

```sh
npm ci                            # install the two dev dependencies
npm run build                     # compile src/ into site/js/
python3 -m http.server -d site    # or any other static file server
```

Then open http://localhost:8000.

## Planning changes

Changes are planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in `openspec/`. You need the OpenSpec CLI only to plan changes, not to build, test or contribute code.

## License

[MIT](LICENSE)
