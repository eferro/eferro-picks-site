# Plan

## Quality and maintainability improvements
- [x] Add missing MIT `LICENSE` file referenced in the README.
- [x] Configure `ReactMarkdown` with `rehype-sanitize` to prevent potential XSS in `TalkDetail`.
- [ ] Set up Husky pre-commit hook to run `npm test -- --run` and `npm run lint`.
- [ ] Add a `typecheck` script (`tsc --noEmit`) and integrate it into CI.
- [ ] Resolve `Unknown env config "http-proxy"` npm warning by cleaning up `.npmrc` or environment configuration.
- [ ] Include an `npm audit` step in CI to detect vulnerabilities and keep dependencies updated.
