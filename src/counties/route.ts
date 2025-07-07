import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCounties,
  getCity,
  updateCity,
  bulkCreateCounties,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const counties = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

counties
  .route("/counties")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCounties))
  .post(asyncHandler(isAuthenticated), asyncHandler(createCity));

counties
  .route("/counties/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateCounties));

counties
  .route("/counties/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCity))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateCity))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteCity));

export default counties;
