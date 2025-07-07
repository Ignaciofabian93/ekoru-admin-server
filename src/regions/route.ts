import { Router } from "express";
import {
  createRegion,
  deleteRegion,
  getRegions,
  getRegion,
  updateRegion,
  bulkCreateRegions,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const regions = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

regions
  .route("/regions")
  .get(asyncHandler(isAuthenticated), asyncHandler(getRegions))
  .post(asyncHandler(isAuthenticated), asyncHandler(createRegion));

regions
  .route("/regions/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateRegions));

regions
  .route("/regions/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getRegion))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateRegion))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteRegion));

export default regions;
