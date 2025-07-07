import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getUserCategories = async (req: Request, res: Response) => {
  try {
    const userCategories = await prisma.userCategory.findMany();
    res.status(200).json(userCategories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener categorías de usuario" });
  }
};

export const getUserCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userCategory = await prisma.userCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!userCategory) {
      return res
        .status(404)
        .json({ error: "Categoría de usuario no encontrada" });
    }
    res.status(200).json(userCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener la categoría de usuario" });
  }
};

export const createUserCategory = async (req: Request, res: Response) => {
  const { categoryDiscountAmount, name, level, pointsThreshold } = req.body;
  try {
    const newUserCategory = await prisma.userCategory.create({
      data: { categoryDiscountAmount, name, level, pointsThreshold },
    });
    res.status(201).json(newUserCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar crear la categoría de usuario" });
  }
};

export const updateUserCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { categoryDiscountAmount, name, level, pointsThreshold } = req.body;
  try {
    const updatedUserCategory = await prisma.userCategory.update({
      where: { id: Number(id) },
      data: { categoryDiscountAmount, name, level, pointsThreshold },
    });
    res.status(200).json(updatedUserCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar actualizar la categoría de usuario" });
  }
};

export const deleteUserCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.userCategory.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar eliminar la categoría de usuario" });
  }
};

export const bulkCreateUserCategories = async (req: Request, res: Response) => {
  const { userCategories } = req.body;

  // Validate input
  if (!Array.isArray(userCategories) || userCategories.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de categorías de usuario no vacío",
    });
  }

  // Validate each user category object
  const invalidItems: number[] = [];
  const validUserCategories = userCategories.filter((userCat, index) => {
    if (
      !userCat.name ||
      typeof userCat.name !== "string" ||
      userCat.name.trim() === "" ||
      typeof userCat.level !== "number" ||
      isNaN(userCat.level) ||
      typeof userCat.categoryDiscountAmount !== "number" ||
      isNaN(userCat.categoryDiscountAmount) ||
      typeof userCat.pointsThreshold !== "number" ||
      isNaN(userCat.pointsThreshold)
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Categorías de usuario inválidas en las filas: ${invalidItems.join(", ")}. Verifique que todas tengan name, level, categoryDiscountAmount y pointsThreshold válidos.`,
    });
  }

  try {
    // Clean and prepare data
    const userCategoryData = validUserCategories.map((userCat) => ({
      name: userCat.name.trim(),
      level: userCat.level,
      categoryDiscountAmount: userCat.categoryDiscountAmount,
      pointsThreshold: userCat.pointsThreshold,
    }));

    // Check for duplicates in the input (same name or same level)
    const categoryNames = userCategoryData.map((d) => d.name.toLowerCase());
    const categoryLevels = userCategoryData.map((d) => d.level);

    const duplicateNames = categoryNames.filter(
      (name, index) => categoryNames.indexOf(name) !== index
    );
    const duplicateLevels = categoryLevels.filter(
      (level, index) => categoryLevels.indexOf(level) !== index
    );

    if (duplicateNames.length > 0) {
      return res.status(400).json({
        error: `Nombres de categorías duplicados encontrados: ${duplicateNames.join(", ")}`,
      });
    }

    if (duplicateLevels.length > 0) {
      return res.status(400).json({
        error: `Niveles de categorías duplicados encontrados: ${duplicateLevels.join(", ")}`,
      });
    }

    // Check for existing user categories in database (by name or level)
    const existingByName = await prisma.userCategory.findMany({
      where: {
        name: {
          in: categoryNames,
          mode: "insensitive",
        },
      },
    });

    const existingByLevel = await prisma.userCategory.findMany({
      where: {
        level: {
          in: categoryLevels,
        },
      },
    });

    if (existingByName.length > 0) {
      const existingNames = existingByName.map((d) => d.name);
      return res.status(400).json({
        error: `Las siguientes categorías de usuario ya existen por nombre: ${existingNames.join(", ")}`,
      });
    }

    if (existingByLevel.length > 0) {
      const existingLevels = existingByLevel.map((d) => d.level);
      return res.status(400).json({
        error: `Las siguientes categorías de usuario ya existen por nivel: ${existingLevels.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdUserCategories = await tx.userCategory.createMany({
        data: userCategoryData,
        skipDuplicates: true,
      });

      // Get the created user categories to return them
      const newUserCategories = await tx.userCategory.findMany({
        where: {
          OR: [
            {
              name: {
                in: categoryNames,
                mode: "insensitive",
              },
            },
            {
              level: {
                in: categoryLevels,
              },
            },
          ],
        },
        orderBy: { level: "asc" },
      });

      return {
        count: createdUserCategories.count,
        userCategories: newUserCategories,
      };
    });

    res.status(201).json({
      message: `${result.count} categorías de usuario creadas exitosamente`,
      count: result.count,
      userCategories: result.userCategories,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear las categorías de usuario en lote",
    });
  }
};
