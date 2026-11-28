
# Stage 1: Build the Angular application
FROM node:24-alpine AS build

WORKDIR /app

# Install dependencies using the lockfile
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Create the production build
RUN npm run build -- --configuration production


# Stage 2: Serve the Angular application
FROM nginx:stable-alpine AS final

# Copy the compiled Angular browser application
COPY --from=build /app/dist/TMS.Client/browser /usr/share/nginx/html

# Use our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
