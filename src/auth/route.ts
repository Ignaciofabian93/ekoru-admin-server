import { Router } from "express";
import { Login, RefreshToken } from "./service";

const auth = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

auth.route("/auth").post(asyncHandler(Login));
auth.route("/refresh").post(asyncHandler(RefreshToken));

export default auth;
