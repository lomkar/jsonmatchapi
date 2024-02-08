import { Request, Response, NextFunction } from "express";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({
  region: process.env.AWS_S3_REGION,
});

import { CognitoJwtVerifier } from "aws-jwt-verify";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { config } from "../config";
import AuthTokenError from "../errors/AuthTokenError";
const userPoolId = config.userPoolId;
const userPoolClientId = config.userPoolClientId;

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (!token) throw new AuthTokenError("No token provided");
  const jwtToken = token.replace("Bearer ", "");

  verifyToken(jwtToken)
    .then(async (valid) => {
      if (valid) {
        getCognitoUser(jwtToken).then(async (email) => {
          let user = await prisma.user.findFirst({
            where: {
              email: email,
            },
            select: {
              id: true,
              email: true,
              cognitouserid: true,
            },
          });

          if (!user) {
            throw new AuthTokenError("User does not exists");
          }
          req.user = {
            cognitouserid: user.cognitouserid || "",
            email: user.email || "",
            id: user.id,
          };
          next();
        });
      } else {
        throw Error("Not valid Token");
      }
    })
    .catch((error) => {
      return res.json({
        isAuth: false,
        error: true,
      });
    });
};

const verifyToken = async (token: string) => {
  // Verifier that expects valid access tokens:
  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "access",
    clientId: userPoolClientId,
  });

  try {
    const payload = await verifier.verify(token);

    return true;
  } catch {
    console.log("Token not valid!");
    return false;
  }
};

const getCognitoUser = async (jwtToken: string) => {
  const params = {
    AccessToken: jwtToken,
  };

  const command = new GetUserCommand(params);
  const response = await cognitoIdentityServiceProvider.send(command);

  let email = response.UserAttributes?.find((f) => f.Name === "email")?.Value;
  if (email) {
    return email;
  }
};
