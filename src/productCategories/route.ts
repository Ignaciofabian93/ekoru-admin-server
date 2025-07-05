import { Router } from "express";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  getProductCategory,
  updateProductCategory,
} from "./service";

const productCategories = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

productCategories
  .route("/productCategories")
  .get(asyncHandler(getProductCategories))
  .post(asyncHandler(createProductCategory));
productCategories
  .route("/productCategories/:id")
  .get(asyncHandler(getProductCategory))
  .put(asyncHandler(updateProductCategory))
  .delete(asyncHandler(deleteProductCategory));

export default productCategories;
