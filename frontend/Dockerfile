# Step 1: Build the React application
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:stable-alpine as production-stage

# Copy the build output to the Nginx html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom nginx config if we had one, but default works for simple SPAs
# EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
