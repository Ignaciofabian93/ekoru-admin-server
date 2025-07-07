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
      orderBy: { productCategoryName: "asc" },
    });
    res.status(200).json(userCategories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener categorías de productos" });
  }
};

export const getProductCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productCategory = await prisma.productCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!productCategory) {
      return res
        .status(404)
        .json({ error: "Categoría de producto no encontrada" });
    }
    res.status(200).json(productCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener la categoría de producto" });
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
    res
      .status(500)
      .json({ error: "Error al intentar crear la categoría de producto" });
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
    res
      .status(500)
      .json({ error: "Error al intentar actualizar la categoría de producto" });
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
    res
      .status(500)
      .json({ error: "Error al intentar eliminar la categoría de producto" });
  }
};

export const bulkCreateProductCategories = async (
  req: Request,
  res: Response
) => {
  const { productCategories } = req.body;

  // Validate input
  if (!Array.isArray(productCategories) || productCategories.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de categorías de productos no vacío",
    });
  }

  // Validate each product category object
  const invalidItems: number[] = [];
  const validProductCategories = productCategories.filter((prodCat, index) => {
    // Required fields validation
    if (
      !prodCat.productCategoryName ||
      typeof prodCat.productCategoryName !== "string" ||
      prodCat.productCategoryName.trim() === "" ||
      !prodCat.departmentCategoryId ||
      typeof prodCat.departmentCategoryId !== "number"
    ) {
      invalidItems.push(index + 1);
      return false;
    }

    // Optional numeric fields validation
    const numericFields = [
      "averageWeight",
      "firstMaterialTypeId",
      "firstMaterialTypeQuantity",
      "secondMaterialTypeId",
      "secondMaterialTypeQuantity",
      "thirdMaterialTypeId",
      "thirdMaterialTypeQuantity",
      "fourthMaterialTypeId",
      "fourthMaterialTypeQuantity",
      "fifthMaterialTypeId",
      "fifthMaterialTypeQuantity",
    ];

    for (const field of numericFields) {
      if (
        prodCat[field] !== null &&
        prodCat[field] !== undefined &&
        (typeof prodCat[field] !== "number" || isNaN(prodCat[field]))
      ) {
        invalidItems.push(index + 1);
        return false;
      }
    }

    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Categorías de productos inválidas en las filas: ${invalidItems.join(", ")}. Verifique que todas tengan un nombre válido y un departmentCategoryId.`,
    });
  }

  try {
    // Clean and prepare data
    const productCategoryData = validProductCategories.map((prodCat) => ({
      productCategoryName: prodCat.productCategoryName.trim(),
      departmentCategoryId: prodCat.departmentCategoryId,
      keywords: prodCat.keywords || null,
      averageWeight: prodCat.averageWeight || null,
      firstMaterialTypeId: prodCat.firstMaterialTypeId || null,
      firstMaterialTypeQuantity: prodCat.firstMaterialTypeQuantity || null,
      secondMaterialTypeId: prodCat.secondMaterialTypeId || null,
      secondMaterialTypeQuantity: prodCat.secondMaterialTypeQuantity || null,
      thirdMaterialTypeId: prodCat.thirdMaterialTypeId || null,
      thirdMaterialTypeQuantity: prodCat.thirdMaterialTypeQuantity || null,
      fourthMaterialTypeId: prodCat.fourthMaterialTypeId || null,
      fourthMaterialTypeQuantity: prodCat.fourthMaterialTypeQuantity || null,
      fifthMaterialTypeId: prodCat.fifthMaterialTypeId || null,
      fifthMaterialTypeQuantity: prodCat.fifthMaterialTypeQuantity || null,
      size: prodCat.size || null,
      weightUnit: prodCat.weightUnit || null,
    }));

    // Check for duplicates in the input (same name and departmentCategoryId combination)
    const categoryKeys = productCategoryData.map(
      (d) => `${d.productCategoryName.toLowerCase()}-${d.departmentCategoryId}`
    );
    const duplicateKeys = categoryKeys.filter(
      (key, index) => categoryKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Categorías de productos duplicadas encontradas`,
      });
    }

    // Verify that all departmentCategoryIds exist
    const departmentCategoryIds = [
      ...new Set(productCategoryData.map((d) => d.departmentCategoryId)),
    ];
    const existingDepartmentCategories =
      await prisma.departmentCategory.findMany({
        where: {
          id: { in: departmentCategoryIds },
        },
      });

    const existingDepartmentCategoryIds = existingDepartmentCategories.map(
      (d) => d.id
    );
    const invalidDepartmentCategoryIds = departmentCategoryIds.filter(
      (id) => !existingDepartmentCategoryIds.includes(id)
    );

    if (invalidDepartmentCategoryIds.length > 0) {
      return res.status(400).json({
        error: `Los siguientes departmentCategoryIds no existen: ${invalidDepartmentCategoryIds.join(", ")}`,
      });
    }

    // Collect all material type IDs for validation
    const materialTypeIds = new Set<number>();
    productCategoryData.forEach((d) => {
      if (d.firstMaterialTypeId) materialTypeIds.add(d.firstMaterialTypeId);
      if (d.secondMaterialTypeId) materialTypeIds.add(d.secondMaterialTypeId);
      if (d.thirdMaterialTypeId) materialTypeIds.add(d.thirdMaterialTypeId);
      if (d.fourthMaterialTypeId) materialTypeIds.add(d.fourthMaterialTypeId);
      if (d.fifthMaterialTypeId) materialTypeIds.add(d.fifthMaterialTypeId);
    });

    // Verify that all material type IDs exist (if any are provided)
    if (materialTypeIds.size > 0) {
      const existingMaterialTypes =
        await prisma.materialImpactEstimate.findMany({
          where: {
            id: { in: Array.from(materialTypeIds) },
          },
        });

      const existingMaterialTypeIds = existingMaterialTypes.map(
        (m: any) => m.id
      );
      const invalidMaterialTypeIds = Array.from(materialTypeIds).filter(
        (id) => !existingMaterialTypeIds.includes(id)
      );

      if (invalidMaterialTypeIds.length > 0) {
        return res.status(400).json({
          error: `Los siguientes materialTypeIds no existen: ${invalidMaterialTypeIds.join(", ")}`,
        });
      }
    }

    // Check for existing product categories in database
    const existingProductCategories = await prisma.productCategory.findMany({
      where: {
        OR: productCategoryData.map((d) => ({
          productCategoryName: {
            equals: d.productCategoryName,
            mode: "insensitive",
          },
          departmentCategoryId: d.departmentCategoryId,
        })),
      },
    });

    if (existingProductCategories.length > 0) {
      const existingNames = existingProductCategories.map(
        (d) =>
          `${d.productCategoryName} (Dept Cat ID: ${d.departmentCategoryId})`
      );
      return res.status(400).json({
        error: `Las siguientes categorías de productos ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdProductCategories = await tx.productCategory.createMany({
        data: productCategoryData,
        skipDuplicates: true,
      });

      // Get the created product categories to return them
      const newProductCategories = await tx.productCategory.findMany({
        where: {
          OR: productCategoryData.map((d) => ({
            productCategoryName: {
              equals: d.productCategoryName,
              mode: "insensitive",
            },
            departmentCategoryId: d.departmentCategoryId,
          })),
        },
        include: {
          firstMaterialType: true,
          secondMaterialType: true,
          thirdMaterialType: true,
          fourthMaterialType: true,
          fifthMaterialType: true,
        },
        orderBy: { productCategoryName: "asc" },
      });

      return {
        count: createdProductCategories.count,
        productCategories: newProductCategories,
      };
    });

    res.status(201).json({
      message: `${result.count} categorías de productos creadas exitosamente`,
      count: result.count,
      productCategories: result.productCategories,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear las categorías de productos en lote",
    });
  }
};
