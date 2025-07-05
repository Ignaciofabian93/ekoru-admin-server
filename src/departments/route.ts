import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
} from "./service";

const departments = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

departments
  .route("/departments")
  .get(asyncHandler(getDepartments))
  .post(asyncHandler(createDepartment));
departments
  .route("/departments/:id")
  .get(asyncHandler(getDepartment))
  .put(asyncHandler(updateDepartment))
  .delete(asyncHandler(deleteDepartment));

export default departments;
