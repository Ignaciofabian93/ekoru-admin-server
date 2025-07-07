import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  getCountries,
  getCountry,
  updateCountry,
  bulkCreateCountries,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const countries = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

countries
  .route("/countries")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCountries))
  .post(asyncHandler(isAuthenticated), asyncHandler(createCountry));

countries
  .route("/countries/bulk")
  .post(asyncHandler(isAuthenticated), asyncHandler(bulkCreateCountries));

countries
  .route("/countries/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getCountry))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateCountry))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteCountry));

export default countries;
