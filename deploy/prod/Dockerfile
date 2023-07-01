FROM node:alpine

RUN apk update && apk upgrade --no-cache && apk add --no-cache curl
WORKDIR /app
COPY ./src .
RUN npm i --ignore-scripts
USER node

ENTRYPOINT ["node"]
CMD ["index.js"]

EXPOSE 80
HEALTHCHECK --interval=1m --timeout=20s --retries=3 CMD curl --fail http://localhost:80 || exit 1