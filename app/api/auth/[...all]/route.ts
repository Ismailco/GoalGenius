import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge";

export const { GET, POST } = toNextJsHandler(auth);

console.log(`Drizzle config, Node env: ${process.env.NODE_ENV} \n Next env: ${process.env.NEXTJS_ENV} \n Next public env: ${process.env.NEXT_PUBLIC_NEXTJS_ENV} \n Next public env ID: ${process.env.NEXT_PUBLIC_CLOUDFLARE_D1_ACCOUNT_ID} \n Next public env DB: ${process.env.NEXT_PUBLIC_CLOUDFLARE_D1_DATABASE_ID} \n Next public env TOKEN: ${process.env.NEXT_PUBLIC_CLOUDFLARE_D1_API_TOKEN} `);

console.log(`D1 DB: ${process.env.DB}`);
