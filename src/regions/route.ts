import { Router } from "express";
import {
  createRegion,
  deleteRegion,
  getRegions,
  getRegion,
  updateRegion,
} from "./service";

const regions = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

regions
  .route("/regions")
  .get(asyncHandler(getRegions))
  .post(asyncHandler(createRegion));
regions
  .route("/regions/:id")
  .get(asyncHandler(getRegion))
  .put(asyncHandler(updateRegion))
  .delete(asyncHandler(deleteRegion));

export default regions;
