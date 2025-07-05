import { type Badge, type ProductSize, type WeightUnit } from "./enums";

export type Product = {
  id: number;
  sku?: string;
  barcode?: string;
  color?: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  hasOffer: boolean;
  offerPrice: number;
  stock: number;
  isExchangeable: boolean;
  interests: string[];
  isActive: boolean;
  ratings: number;
  ratingCount: number;
  reviewsNumber: number;
  userId: string;
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
  productCategoryId: number;
};

export type ProductCategory = {
  id: number;
  productCategoryName: string;
  departmentCategoryId: number;
  keywords: string[];
  materialImpactEstimateId: number;
  size?: ProductSize;
  minWeight?: number;
  maxWeight?: number;
  weightUnit?: WeightUnit;
};

export type MaterialImpactEstimate = {
  id: number;
  materialType: string;
  minWeight: number;
  maxWeight: number;
  estimatedCo2SavingsKG: number;
  estimatedWaterSavingsLT: number;
  estimatedWasteSavingsKG: number;
  notes: string;
};

export type DepartmentCategory = {
  id: number;
  departmentCategoryName: string;
  departmentId: number;
};

export type Department = {
  id: number;
  departmentName: string;
};
