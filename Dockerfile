# Stage 1: Build static site with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY website ./website
COPY content ./content

RUN node website/main.js

# Stage 2: Serve static files with lightweight Nginx server
FROM nginx:alpine

COPY --from=builder /app/website/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
