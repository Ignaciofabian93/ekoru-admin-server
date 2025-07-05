import { Router } from "express";
import {
  createDepartmentCategory,
  deleteDepartmentCategory,
  getDepartmentCategoryCategories,
  getDepartmentCategory,
  updateDepartmentCategory,
} from "./service";

const departmentCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

departmentCategories
  .route("/departmentCategories")
  .get(asyncHandler(getDepartmentCategoryCategories))
  .post(asyncHandler(createDepartmentCategory));
departmentCategories
  .route("/departmentCategories/:id")
  .get(asyncHandler(getDepartmentCategory))
  .put(asyncHandler(updateDepartmentCategory))
  .delete(asyncHandler(deleteDepartmentCategory));

export default departmentCategories;
