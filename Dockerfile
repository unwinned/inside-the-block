FROM node:22.23.0-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
ENTRYPOINT ["node", "src/main.ts"]
CMD ["all"]
