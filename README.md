# Lines

An open-source browser version of **Color Lines**, also known as **Lines98**: move balls on a 9×9 board to line up five or more of the same color. It is becoming an installable web app that works offline and keeps your game on your device, with no backend.

Work in progress: https://lines.bortnik.org shows a placeholder for now.

## Requirements

Node.js 22.8 or newer. Builds that can't run TypeScript files directly, such as Ubuntu's `nodejs` package, work too.

## Build and run locally

```sh
npm ci                            # install the two dev dependencies
npm run build                     # compile src/ into site/js/
python3 -m http.server -d site    # or any other static file server
```

Then open http://localhost:8000.

## Testing

```sh
npm test
```

This compiles `test/`, together with the `src/` modules the tests import, into `build/`, then runs the tests with Node's built-in test runner. Failures point at lines in the TypeScript sources. Two of the tests guard project rules: the site refers to its own files with relative URLs only, and the only dependencies are `typescript` and `@types/node`.

## Deploys

Changes reach `main` only through pull requests, squash-merged once the `test (22)` and `test (lts/*)` checks pass. Every push to `main` runs the tests again and, if they pass, publishes the `site/` folder, including the compiled `site/js/`, to GitHub Pages at https://lines.bortnik.org. Other branches and pull requests are tested but never published. The workflow is `.github/workflows/ci.yml`.

## Hosting setup (maintainers)

One-time steps, in the order GitHub documents:

1. Verify `bortnik.org` for GitHub Pages: profile → Settings → Pages → Add a domain, then create the TXT record GitHub shows (`_github-pages-challenge-timbortnik`) at the DNS provider.
2. In this repository, set Settings → Pages → Build and deployment → Source to **GitHub Actions**.
3. After the first deploy, set Settings → Pages → Custom domain to `lines.bortnik.org`. Only then create the DNS record: CNAME `lines` → `timbortnik.github.io`.
4. Tick **Enforce HTTPS** once GitHub offers it, which can take up to 24 hours.

No `CNAME` file is needed in the repository: deploys from GitHub Actions ignore it. Once the custom domain is set, the old address https://timbortnik.github.io/lines/ redirects to it.

## Planning changes

Changes are planned with [OpenSpec](https://github.com/Fission-AI/OpenSpec) in `openspec/`. You need the OpenSpec CLI only to plan changes, not to build, test or contribute code.

## License

[MIT](LICENSE)
