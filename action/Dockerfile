FROM oven/bun:1

# Create and set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb /app/

# Install dependencies
RUN bun i

# Copy source code
COPY src /app/src

# Run action
ENTRYPOINT ["bun", "src/index.ts"]
