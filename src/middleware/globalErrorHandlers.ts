import { Request, Response, NextFunction } from "express";
import CustomError from "../errors/CustomError";
import InfoError from "../errors/InfoError";
import AuthTokenError from "../errors/AuthTokenError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof CustomError) {
    return res.status(err.errorCode).send({success:false, errors: err.serializeErrors() });
  }

  if (err instanceof InfoError) {
    return res.status(err.errorCode).send({success:false, errors: err.serializeErrors() });
  }
  if (err instanceof AuthTokenError) {
    return res.status(err.errorCode).send({success:false, errors: err.serializeErrors() });
  }

  res.status(400).send({ success:false,error: [{ message: "Some error occured" }] });
};
export default errorHandler;
