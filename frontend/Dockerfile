FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY src/*.html /usr/share/nginx/html/
COPY src/*.css /usr/share/nginx/html/
COPY src/*.js /usr/share/nginx/html/
COPY src/assets/ /usr/share/nginx/html/assets/
COPY src/fotos/ /usr/share/nginx/html/fotos/
COPY src/rustikcg-logo.png /usr/share/nginx/html/

EXPOSE 80