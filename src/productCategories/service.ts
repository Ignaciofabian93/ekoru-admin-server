import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const userCategories = await prisma.productCategory.findMany({
      include: {
        firstMaterialType: true,
        secondMaterialType: true,
        thirdMaterialType: true,
        fourthMaterialType: true,
        fifthMaterialType: true,
      },
    });
    res.status(200).json(userCategories);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productCategory = await prisma.productCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!productCategory) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(productCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createProductCategory = async (req: Request, res: Response) => {
  const {
    productCategoryName,
    departmentCategoryId,
    keywords,
    averageWeight,
    firstMaterialTypeId,
    firstMaterialTypeQuantity,
    secondMaterialTypeId,
    secondMaterialTypeQuantity,
    thirdMaterialTypeId,
    thirdMaterialTypeQuantity,
    fourthMaterialTypeId,
    fourthMaterialTypeQuantity,
    fifthMaterialTypeId,
    fifthMaterialTypeQuantity,
    size,
    weightUnit,
  } = req.body;
  try {
    const newProductCategory = await prisma.productCategory.create({
      data: {
        productCategoryName,
        departmentCategoryId,
        keywords,
        averageWeight,
        firstMaterialTypeId,
        firstMaterialTypeQuantity,
        secondMaterialTypeId,
        secondMaterialTypeQuantity,
        thirdMaterialTypeId,
        thirdMaterialTypeQuantity,
        fourthMaterialTypeId,
        fourthMaterialTypeQuantity,
        fifthMaterialTypeId,
        fifthMaterialTypeQuantity,
        size,
        weightUnit,
      },
    });
    res.status(201).json(newProductCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    productCategoryName,
    departmentCategoryId,
    keywords,
    averageWeight,
    firstMaterialTypeId,
    firstMaterialTypeQuantity,
    secondMaterialTypeId,
    secondMaterialTypeQuantity,
    thirdMaterialTypeId,
    thirdMaterialTypeQuantity,
    fourthMaterialTypeId,
    fourthMaterialTypeQuantity,
    fifthMaterialTypeId,
    fifthMaterialTypeQuantity,
    size,
    weightUnit,
  } = req.body;
  try {
    const updatedProductCategory = await prisma.productCategory.update({
      where: { id: Number(id) },
      data: {
        productCategoryName,
        departmentCategoryId,
        keywords,
        averageWeight,
        firstMaterialTypeId,
        firstMaterialTypeQuantity,
        secondMaterialTypeId,
        secondMaterialTypeQuantity,
        thirdMaterialTypeId,
        thirdMaterialTypeQuantity,
        fourthMaterialTypeId,
        fourthMaterialTypeQuantity,
        fifthMaterialTypeId,
        fifthMaterialTypeQuantity,
        size,
        weightUnit,
      },
    });
    res.status(200).json(updatedProductCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.productCategory.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
