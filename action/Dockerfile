FROM oven/bun:1

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
        echo \"Running in development mode\" && \
        cd \"$GITHUB_WORKSPACE/packages/cli\" && \
        bun install && \
        bun link && \
        cd /action && \
        bun link languine; \
    else \
        cd \"$GITHUB_WORKSPACE\" && \
        bun /action/src/index.ts; \
    fi \
"]