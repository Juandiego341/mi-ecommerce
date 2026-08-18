import { defineConfig } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // El CLI busca esta propiedad específica para comandos como 'migrate' y 'db pull'
  datasource: {
    url: process.env.DATABASE_URL,
  },
})