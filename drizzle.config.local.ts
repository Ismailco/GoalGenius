import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './models/schemas.ts',
  out: './models',
  dialect: 'sqlite',
  // driver: 'd1-http',
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/2de96be69f5f153c13592d3e6059b36b0c576a977e98836d01f8386c65c8067d.sqlite"
  },
});
