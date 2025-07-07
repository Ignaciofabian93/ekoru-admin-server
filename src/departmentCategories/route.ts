import { Router } from "express";
import {
  createDepartmentCategory,
  deleteDepartmentCategory,
  getDepartmentCategoryCategories,
  getDepartmentCategory,
  updateDepartmentCategory,
  bulkCreateDepartmentCategories,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const departmentCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

departmentCategories
  .route("/departmentCategories")
  .get(
    asyncHandler(isAuthenticated),
    asyncHandler(getDepartmentCategoryCategories)
  )
  .post(asyncHandler(isAuthenticated), asyncHandler(createDepartmentCategory));

departmentCategories
  .route("/departmentCategories/bulk")
  .post(
    asyncHandler(isAuthenticated),
    asyncHandler(bulkCreateDepartmentCategories)
  );

departmentCategories
  .route("/departmentCategories/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getDepartmentCategory))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateDepartmentCategory))
  .delete(
    asyncHandler(isAuthenticated),
    asyncHandler(deleteDepartmentCategory)
  );

export default departmentCategories;
