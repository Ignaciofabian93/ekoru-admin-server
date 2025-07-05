import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCounties,
  getCity,
  updateCity,
} from "./service";

const counties = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

counties
  .route("/counties")
  .get(asyncHandler(getCounties))
  .post(asyncHandler(createCity));
counties
  .route("/counties/:id")
  .get(asyncHandler(getCity))
  .put(asyncHandler(updateCity))
  .delete(asyncHandler(deleteCity));

export default counties;
