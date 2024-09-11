# Backend app for [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7d43b68b39cd41aa830120371be736ad)](https://www.codacy.com/gh/Visual-Regression-Tracker/backend?utm_source=github.com&utm_medium=referral&utm_content=Visual-Regression-Tracker/backend&utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/7d43b68b39cd41aa830120371be736ad)](https://www.codacy.com/gh/Visual-Regression-Tracker/backend?utm_source=github.com&utm_medium=referral&utm_content=Visual-Regression-Tracker/backend&utm_campaign=Badge_Coverage)

## Local run using Docker

Just replace `...` with your database url in the following command

```
docker run --rm -it -v $(pwd):/app -w /app -p 4200:4200 --platform linux/amd64 node:14-alpine3.17 /bin/sh -c "npm i && export DATABASE_URL='...' && npm run start"
```

for debuging just use:

```
docker run --rm -it -v $(pwd):/app -w /app -p 4200:4200 -p 9229:9229 --platform linux/amd64 node:14-alpine3.17 /bin/sh -c "npm i && export DATABASE_URL='...' && npx nest start --debug 0.0.0.0:9229 --watch"


## Local setup

- Install Node `14`
- clone repo
- Update `.env` and `prisma/.env`
- Make sure Postgres is up and running
- `npm i`
- `npm run test`
- Create DB structure and apply migrations `npx prisma migrate up -c --experimental`
- `npm run test:e2e`
- Seed initial data `npx ts-node prisma/seed.ts`
- `npm run start:debug`

## Local HTTPS config

- Generate keys [here](https://www.selfsignedcertificate.com/)
- place in folder `/secrets` named `ssl.cert` and `ssl.key`