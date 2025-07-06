import { Router } from "express";
import { CreateUser, Login, Profile, RefreshToken } from "./service";
import { isAuthenticated } from "../middleware/auth";

const auth = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

auth.route("/auth").post(asyncHandler(Login));
auth.route("/refresh").post(asyncHandler(RefreshToken));
auth
  .route("/profile")
  .get(asyncHandler(isAuthenticated), asyncHandler(Profile));
auth.route("/create").post(asyncHandler(CreateUser));

export default auth;
