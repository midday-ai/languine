FROM oven/bun:1

# Install git
RUN apt-get update && apt-get install -y git

# Create and set working directory
WORKDIR /action

# Copy package files, lockfile and config files for the action
COPY bun.lock package.json tsconfig.json /action/

# Copy action source code
COPY src /action/src

# Install action dependencies
RUN bun install --frozen-lockfile

# Run action
ENTRYPOINT ["bun", "run", "/action/src/index.ts"]

