import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  getCountries,
  getCountry,
  updateCountry,
} from "./service";

const countries = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

countries
  .route("/countries")
  .get(asyncHandler(getCountries))
  .post(asyncHandler(createCountry));
countries
  .route("/countries/:id")
  .get(asyncHandler(getCountry))
  .put(asyncHandler(updateCountry))
  .delete(asyncHandler(deleteCountry));

export default countries;
