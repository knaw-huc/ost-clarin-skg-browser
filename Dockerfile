FROM node:alpine AS builder
WORKDIR /app
WORKDIR /app
COPY . /app
RUN npm install && npm run build

FROM nginx:stable-alpine
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
