import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCities,
  getCity,
  updateCity,
} from "./service";

const cities = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

cities
  .route("/cities")
  .get(asyncHandler(getCities))
  .post(asyncHandler(createCity));
cities
  .route("/cities/:id")
  .get(asyncHandler(getCity))
  .put(asyncHandler(updateCity))
  .delete(asyncHandler(deleteCity));

export default cities;
