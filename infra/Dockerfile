# Builds the production site and serves it with `astro preview`, the same artifact the e2e tests run.
# Build context is the repository root: docker build --file infra/Dockerfile .

FROM node:24.21.0-bookworm-slim AS node

FROM oven/bun:1.4.2-slim AS base
# Bun installs and runs the scripts. Astro's engine check accepts Node 24 (`engines` in package.json).
COPY --from=node /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
RUN chown bun:bun /app

FROM base AS build
COPY package.json bun.lock bunfig.toml ./
# The `prepare` script (husky) needs a git checkout: skipped here.
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
# No LINKS_DASHBOARD_TOKEN and no VERCEL_ENV in the image: scripts/sync-links.ts only validates the
# catalogue and sends nothing to the links dashboard.
RUN bun run build

FROM base AS runtime
# `astro preview` serves `dist/`. The dev dependencies stay because the preview command lives in the project.
COPY --from=build --chown=bun:bun /app /app
# The embedded database (PGlite) lives here; the folder exists so a named volume inherits its owner.
RUN mkdir -p /app/.data && chown bun:bun /app/.data
USER bun
ENV PGLITE_DIR=/app/.data/pglite
VOLUME /app/.data
EXPOSE 4173
HEALTHCHECK --interval=5s --timeout=5s --start-period=20s --retries=12 \
	CMD bun --eval "fetch('http://127.0.0.1:4173/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "4173"]
