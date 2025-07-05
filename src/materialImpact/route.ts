import { Router } from "express";
import {
  createMaterialImpact,
  deleteMaterialImpact,
  getMaterialImpacts,
  getMaterialImpact,
  updateMaterialImpact,
} from "./service";

const materialImpacts = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

materialImpacts
  .route("/materialImpacts")
  .get(asyncHandler(getMaterialImpacts))
  .post(asyncHandler(createMaterialImpact));
materialImpacts
  .route("/materialImpacts/:id")
  .get(asyncHandler(getMaterialImpact))
  .put(asyncHandler(updateMaterialImpact))
  .delete(asyncHandler(deleteMaterialImpact));

export default materialImpacts;
