FROM nginx:alpine

# Copie des pages HTML, styles CSS et scripts JS
COPY ./html /usr/share/nginx/html/
COPY ./css /usr/share/nginx/html/css/
COPY ./js /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80