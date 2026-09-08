FROM node:22-bookworm-slim AS base

RUN id -u node >/dev/null 2>&1 || useradd --create-home --shell /bin/bash node

ENV DEBIAN_FRONTEND=noninteractive \
    PATH=/home/node/.local/bin:$PATH \
    npm_config_cache=/home/node/.npm \
    npm_config_userconfig=/home/node/.npmrc

WORKDIR /workspaces/Retire

# Install only needed system packages and keep the image lean.
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash ca-certificates git curl openssl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /home/node/.npm \
    && chown -R node:node /home/node /workspaces/Retire

USER node

COPY --chown=node:node package*.json ./
RUN npm ci --include=dev --no-audit --prefer-offline

COPY --chown=node:node . .
RUN npx prisma generate

CMD ["bash"]
