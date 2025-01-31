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

# Add bun's global bin directory to PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Run action
CMD ["sh", "-c", "\
    cd \"$GITHUB_WORKSPACE\" && \
    bun /action/src/index.ts \
"]