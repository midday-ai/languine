FROM oven/bun:1

# Install git
RUN apt-get update && apt-get install -y git

# Create and set working directory
WORKDIR /action

# Copy package files and config files for the action
COPY package.json tsconfig.json /action/

# Install action dependencies
RUN bun install

# Copy action source code
COPY src /action/src

# Run action with environment detection
CMD ["sh", "-c", "\
    if [ \"$DEV_MODE\" = \"true\" ]; then \
        mkdir -p ~/.ssh && ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts && \
        echo \"Running in development mode\" && \
        cd \"$GITHUB_WORKSPACE/packages/cli\" && \
        bun install && \
        bun run build && \
        cd \"$GITHUB_WORKSPACE\" && \
        LANGUINE_CLI=\"$GITHUB_WORKSPACE/packages/cli/dist/index.js\" bun /action/src/index.ts; \
    else \
        cd \"$GITHUB_WORKSPACE\" && \
        bun /action/src/index.ts; \
    fi \
"]