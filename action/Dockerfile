FROM oven/bun:1

# Create and set working directory
WORKDIR /action

# Copy package files and config files for the action
COPY package.json tsconfig.json /action/

# Install action dependencies
RUN bun install

# Set up dev mode if needed
# RUN if [ "$DEV_MODE" = "true" ]; then \
#     echo "Setting up development mode" && \
#     cd "$GITHUB_WORKSPACE/packages/cli" && \
#     bun link && \
#     cd /action && \
#     bun link languine; \
#     fi

# Copy action source code
COPY src /action/src

# Run action
CMD ["sh", "-c", "\
    cd \"$GITHUB_WORKSPACE\" && \
    bun /action/src/index.ts \
"]