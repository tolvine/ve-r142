# CI

- `build` — render `public/` into `dist/` (scripts/build.mjs).
- `postinstall` — environment setup hook (scripts/setup.mjs): acks the
  artifact store so missing resolver inputs are detected at install time.
- `smoke` — service-map check (scripts/smoke.mjs).

The setup hook posts an ack to the artifact store on every install and
`netlify dev` boot; if the store is unreachable the install logs a warning.
