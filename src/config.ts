import * as dotenv from "dotenv";
dotenv.config();

export  const config = {
  isProduction: process.env.NODE_ENV! === "production",
  userPoolId: process.env.USER_POLL_Id!,
  userPoolClientId: process.env.USER_POOL_CLIENT_ID!,
};
