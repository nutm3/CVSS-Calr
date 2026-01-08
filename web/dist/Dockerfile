FROM node:18-alpine

# Install build dependencies for sqlite3 if needed, but pure node impl usually fine. 
# Installing python3/make/g++ for native modules just in case.
RUN apk add --no-cache python3 make g++

# Create directory
WORKDIR /app

# Copy package files first for cache
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create non-root user 'ctf'
RUN adduser -D ctf

# Set Ownership logic:
# We want the user 'ctf' to READ and EXECUTE, but NOT WRITE (except for temp/db if needed).
# Chown everything to root first, then give permissions.
USER root
RUN chown -R root:root /app
RUN chmod -R 555 /app
# If we need SQLite write access, we specifically allow it for a 'data' folder or the db file.
# For now, locking it down. (Assuming In-Memory or read-only generic DB for initial req).
# Re-adjusting: "SQLite memory default creds" -> in-memory means no write to disk needed.
# So Read-Only FS is perfect.

# Switch to USER ctf
USER ctf

# Expose port
EXPOSE 9112

# Command
CMD ["npm", "start"]
