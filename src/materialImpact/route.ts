import { Router } from "express";
import {
  createMaterialImpact,
  deleteMaterialImpact,
  getMaterialImpacts,
  getMaterialImpact,
  updateMaterialImpact,
  bulkCreateMaterialImpacts,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const materialImpacts = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

materialImpacts
  .route("/materialImpacts")
  .get(asyncHandler(isAuthenticated), asyncHandler(getMaterialImpacts))
  .post(asyncHandler(isAuthenticated), asyncHandler(createMaterialImpact));

materialImpacts
  .route("/materialImpacts/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateMaterialImpacts));

materialImpacts
  .route("/materialImpacts/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getMaterialImpact))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateMaterialImpact))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteMaterialImpact));

export default materialImpacts;
