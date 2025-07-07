import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCities,
  getCity,
  updateCity,
  bulkCreateCities,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const cities = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

cities
  .route("/cities")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCities))
  .post(asyncHandler(isAuthenticated), asyncHandler(createCity));

cities
  .route("/cities/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateCities));

cities
  .route("/cities/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCity))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateCity))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteCity));

export default cities;
