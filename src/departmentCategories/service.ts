import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getDepartmentCategoryCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const departmentCategoryCategories =
      await prisma.departmentCategory.findMany({
        include: {
          department: {
            select: {
              id: true,
              departmentName: true,
            },
          },
        },
        orderBy: {
          departmentCategoryName: "asc",
        },
      });
    res.status(200).json(departmentCategoryCategories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener categorías de departamentos" });
  }
};

export const getDepartmentCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const departmentCategory = await prisma.departmentCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!departmentCategory) {
      return res
        .status(404)
        .json({ error: "Categoría de departamento no encontrada" });
    }
    res.status(200).json(departmentCategory);
  } catch (error) {
    res.status(500).json({
      error: "Error al intentar obtener la categoría de departamento",
    });
  }
};

export const createDepartmentCategory = async (req: Request, res: Response) => {
  const { departmentCategoryName, departmentId } = req.body;
  try {
    const newDepartmentCategory = await prisma.departmentCategory.create({
      data: { departmentCategoryName, departmentId },
    });
    res.status(201).json(newDepartmentCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar crear la categoría de departamento" });
  }
};

export const updateDepartmentCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { departmentCategoryName, departmentId } = req.body;
  try {
    const updatedDepartmentCategory = await prisma.departmentCategory.update({
      where: { id: Number(id) },
      data: { departmentCategoryName, departmentId },
    });
    res.status(200).json(updatedDepartmentCategory);
  } catch (error) {
    res.status(500).json({
      error: "Error al intentar actualizar la categoría de departamento",
    });
  }
};

export const deleteDepartmentCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.departmentCategory.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: "Error al intentar eliminar la categoría de departamento",
    });
  }
};

export const bulkCreateDepartmentCategories = async (
  req: Request,
  res: Response
) => {
  const { departmentCategories } = req.body;

  // Validate input
  if (
    !Array.isArray(departmentCategories) ||
    departmentCategories.length === 0
  ) {
    return res.status(400).json({
      error: "Se requiere un array de categorías de departamentos no vacío",
    });
  }

  // Validate each department category object
  const invalidItems: number[] = [];
  const validDepartmentCategories = departmentCategories.filter(
    (deptCat, index) => {
      if (
        !deptCat.departmentCategoryName ||
        typeof deptCat.departmentCategoryName !== "string" ||
        deptCat.departmentCategoryName.trim() === "" ||
        !deptCat.departmentId ||
        typeof deptCat.departmentId !== "number"
      ) {
        invalidItems.push(index + 1);
        return false;
      }
      return true;
    }
  );

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Categorías de departamentos inválidas en las filas: ${invalidItems.join(", ")}. Verifique que todas tengan un nombre válido y un departmentId.`,
    });
  }

  try {
    // Clean department category names and prepare data
    const departmentCategoryData = validDepartmentCategories.map((deptCat) => ({
      departmentCategoryName: deptCat.departmentCategoryName.trim(),
      departmentId: deptCat.departmentId,
    }));

    // Check for duplicates in the input (same name and departmentId combination)
    const categoryKeys = departmentCategoryData.map(
      (d) => `${d.departmentCategoryName.toLowerCase()}-${d.departmentId}`
    );
    const duplicateKeys = categoryKeys.filter(
      (key, index) => categoryKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Categorías de departamentos duplicadas encontradas`,
      });
    }

    // Verify that all departmentIds exist
    const departmentIds = [
      ...new Set(departmentCategoryData.map((d) => d.departmentId)),
    ];
    const existingDepartments = await prisma.department.findMany({
      where: {
        id: { in: departmentIds },
      },
    });

    const existingDepartmentIds = existingDepartments.map((d: any) => d.id);
    const invalidDepartmentIds = departmentIds.filter(
      (id) => !existingDepartmentIds.includes(id)
    );

    if (invalidDepartmentIds.length > 0) {
      return res.status(400).json({
        error: `Los siguientes departmentIds no existen: ${invalidDepartmentIds.join(", ")}`,
      });
    }

    // Check for existing department categories in database
    const existingDepartmentCategories =
      await prisma.departmentCategory.findMany({
        where: {
          OR: departmentCategoryData.map((d) => ({
            departmentCategoryName: {
              equals: d.departmentCategoryName,
              mode: "insensitive",
            },
            departmentId: d.departmentId,
          })),
        },
      });

    if (existingDepartmentCategories.length > 0) {
      const existingNames = existingDepartmentCategories.map(
        (d: any) => `${d.departmentCategoryName} (Dept ID: ${d.departmentId})`
      );
      return res.status(400).json({
        error: `Las siguientes categorías de departamentos ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const createdDepartmentCategories =
        await tx.departmentCategory.createMany({
          data: departmentCategoryData,
          skipDuplicates: true,
        });

      // Get the created department categories to return them
      const newDepartmentCategories = await tx.departmentCategory.findMany({
        where: {
          OR: departmentCategoryData.map((d) => ({
            departmentCategoryName: {
              equals: d.departmentCategoryName,
              mode: "insensitive",
            },
            departmentId: d.departmentId,
          })),
        },
        include: {
          department: {
            select: {
              id: true,
              departmentName: true,
            },
          },
        },
        orderBy: { departmentCategoryName: "asc" },
      });

      return {
        count: createdDepartmentCategories.count,
        departmentCategories: newDepartmentCategories,
      };
    });

    res.status(201).json({
      message: `${result.count} categorías de departamentos creadas exitosamente`,
      count: result.count,
      departmentCategories: result.departmentCategories,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear las categorías de departamentos en lote",
    });
  }
};
