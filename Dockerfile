FROM node:18.19.0 AS build

WORKDIR /code

COPY .output .output
COPY ./package.json .
COPY ./server/data ./server/data
RUN test -f .output/server/index.mjs || (echo "ERROR: .output not found. Run 'npm run build' before 'docker build'." && exit 1)

FROM node:18.18.2-slim AS app

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
COPY --chown=www:www --from=build /code/package.json .
COPY --chown=www:www --from=build /code/server/data/ ./server/data/

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

    chmod -R 755 /app/scripts/entrypoint.sh

ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

USER www

EXPOSE 8080
ENTRYPOINT ["./scripts/entrypoint.sh" ]