import { Router } from "express";
import {
  createUserCategory,
  deleteUserCategory,
  getUserCategories,
  getUserCategory,
  updateUserCategory,
} from "./service";

const userCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

userCategories
  .route("/userCategories")
  .get(asyncHandler(getUserCategories))
  .post(asyncHandler(createUserCategory));
userCategories
  .route("/userCategories/:id")
  .get(asyncHandler(getUserCategory))
  .put(asyncHandler(updateUserCategory))
  .delete(asyncHandler(deleteUserCategory));

export default userCategories;
