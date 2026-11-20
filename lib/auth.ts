
import { betterAuth } from "better-auth";
import pool from "./db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
