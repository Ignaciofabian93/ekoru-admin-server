import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  bulkCreateDepartments,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const departments = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

departments
  .route("/departments")
  .get(asyncHandler(isAuthenticated), asyncHandler(getDepartments))
  .post(asyncHandler(isAuthenticated), asyncHandler(createDepartment));

departments
  .route("/departments/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateDepartments));

departments
  .route("/departments/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getDepartment))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateDepartment))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteDepartment));

export default departments;
