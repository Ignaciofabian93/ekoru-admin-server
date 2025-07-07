import { Router } from "express";
import {
  createUserCategory,
  deleteUserCategory,
  getUserCategories,
  getUserCategory,
  updateUserCategory,
  bulkCreateUserCategories,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const userCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

userCategories
  .route("/userCategories")
  .get(asyncHandler(isAuthenticated), asyncHandler(getUserCategories))
  .post(asyncHandler(isAuthenticated), asyncHandler(createUserCategory));

userCategories
  .route("/userCategories/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateUserCategories));

userCategories
  .route("/userCategories/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getUserCategory))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateUserCategory))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteUserCategory));

export default userCategories;
