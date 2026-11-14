# Builds the static site and serves `dist/` with nginx. The site is static (`output: 'static'`), so the image
# has no server code: the /admin panel talks to the GitHub API from the browser, and the API, login, contact,
# newsletter and cron routes of the old server code are not served (docs/deploy.md).
# Build context is the repository root: docker build --file infra/Dockerfile --build-arg SITE_URL=https://example.com .

FROM node:24.21.0-bookworm-slim AS node

FROM oven/bun:1.4.2-slim AS build
# Bun installs and runs the scripts. Astro's engine check accepts Node 24 (`engines` in package.json).
COPY --from=node /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
# The `prepare` script (husky) needs a git checkout: skipped here.
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
# Canonicals, sitemap and JSON-LD are written at build time from this origin.
ARG SITE_URL=http://localhost:4321
ENV SITE_URL=$SITE_URL
# No LINKS_DASHBOARD_TOKEN in the image: scripts/sync-links.ts only validates the catalogue.
RUN bun run build

FROM nginx:1.30.6-alpine AS runtime
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=12 \
	CMD wget -q --spider http://127.0.0.1/ || exit 1
