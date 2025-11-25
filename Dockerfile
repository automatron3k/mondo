# Etapa de construcción (si necesitas build tools en el futuro)
FROM nginx:alpine as production

# Copia la configuración de nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos
COPY src/ /usr/share/nginx/html/

# Expone el puerto 80
EXPOSE 80

# Labels para metadata
LABEL maintainer="info@mondo.org"
LABEL description="Mondo static website"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]