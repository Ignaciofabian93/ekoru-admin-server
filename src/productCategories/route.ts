import { Router } from "express";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  getProductCategory,
  updateProductCategory,
  bulkCreateProductCategories,
} from "./service";
import { isAuthenticated } from "../middleware/auth";

const productCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

productCategories
  .route("/productCategories")
  .get(asyncHandler(isAuthenticated), asyncHandler(getProductCategories))
  .post(asyncHandler(isAuthenticated), asyncHandler(createProductCategory));

productCategories
  .route("/productCategories/bulk")
  .post(
    asyncHandler(isAuthenticated),
    asyncHandler(bulkCreateProductCategories)
  );

productCategories
  .route("/productCategories/:id")
  .get(asyncHandler(isAuthenticated), asyncHandler(getProductCategory))
  .put(asyncHandler(isAuthenticated), asyncHandler(updateProductCategory))
  .delete(asyncHandler(isAuthenticated), asyncHandler(deleteProductCategory));

export default productCategories;
