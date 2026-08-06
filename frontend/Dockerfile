FROM nginx:alpine

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie de TOUTES les pages HTML et ressources statiques
COPY html/ /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]