FROM node:16.5.0

RUN apt update
WORKDIR /code
COPY . .

RUN npm install --legacy-peer-deps

RUN apt install apt-transport-https lsb-release ca-certificates curl gnupg -y ; \
    curl https://mirror-cdn.xtom.com/sb/nginx/public.key | apt-key add - ; \
    echo "deb https://mirror-cdn.xtom.com/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sb-nginx.list ; \
    apt update ; \
    apt install nginx-extras nginx -y

COPY default /etc/nginx/sites-available/default

RUN echo '#!/bin/bash' > /entrypoint.sh && \
    echo 'nginx -g "daemon off;" &' >> /entrypoint.sh && \
    echo 'npm start &' >> /entrypoint.sh && \
    echo 'sleep 6 && touch src/App.tsx' >> /entrypoint.sh && \
    echo 'wait' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80
