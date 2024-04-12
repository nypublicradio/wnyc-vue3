FROM node:18.18.2 as build

ARG SENTRY_DSN
ARG SENTRY_ENV
ARG SENTRY_AUTH_TOKEN
ARG ENV
ARG LIVESTREAM_URL
ARG NAVIGATION_API
ARG STORIES_API
ARG IMAGE_BASE_URL
ARG GA_MEASUREMENT_ID
ARG GTM_ID
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG SUPABASE_AUTH_SIGN_IN_REDIRECT_TO
ARG SUPABASE_AUTH_TOKEN_NAME
ARG BFF_URL
ARG OPENWEB_SPOT_ID
ARG NPR_CDS_API_KEY

WORKDIR /code

COPY ./.npmrc .
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
RUN npm install sass

COPY . .
RUN npm run build

FROM node:18.18.2-slim as app


WORKDIR /app

RUN groupadd www && \
    useradd -d /app -s /sbin/nologin -g www www

RUN apt-get update \
    && apt-get install -y \
    curl \
    netcat-traditional \
    nginx-extras \
    python3 \
    python3-pip \
    python3-setuptools \
    unzip \
    supervisor

COPY --chown=www:www scripts/entrypoint.sh ./scripts/entrypoint.sh

COPY --chown=www:www nginx/*.conf /etc/nginx/
COPY --chown=www:www public/robots* ./public/
COPY --chown=www:www public/.well-known ./public/.well-known

COPY --chown=www:www --from=build /code/.output/ ./.output/
COPY --chown=www:www --from=build /code/.nuxt/ ./.nuxt/
COPY --chown=www:www --from=build /code/node_modules/ ./node_modules/
COPY --chown=www:www --from=build /code/package.json .

RUN mkdir -p /var/run/nginx/ && \
    mkdir -p /var/log/nginx/ && \
    mkdir -p /app/log/ && \
    touch /run/nginx.pid && \
    chown -Rf www:www /var/run/nginx && \
    chown -Rf www:www /var/lib/nginx && \
    chown -Rf www:www /var/log/nginx && \
    chown -Rf www:www /etc/nginx && \
    chown -Rf www:www /run/nginx.pid && \
    chown -Rf www:www /app && \
    chmod -R 777 /app/node_modules && \
    chmod -R 755 /app/scripts/entrypoint.sh

ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

USER www

EXPOSE 8080
ENTRYPOINT ["./scripts/entrypoint.sh" ]