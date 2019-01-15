FROM node:8.14.0-alpine

# Set up the workspace
WORKDIR /usr/app

# Install the app dependencies
COPY ./package.json ./
RUN npm install --quiet

# Grab the app source
COPY . .

# Expose the ports
EXPOSE 3000

# Default command
CMD ["node", "server.js"]
