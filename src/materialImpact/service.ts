import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getMaterialImpacts = async (req: Request, res: Response) => {
  try {
    const userCategories = await prisma.materialImpactEstimate.findMany({
      orderBy: { materialType: "asc" },
      select: {
        id: true,
        materialType: true,
        estimatedCo2SavingsKG: true,
        estimatedWaterSavingsLT: true,
      },
    });
    res.status(200).json(userCategories);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener impactos" });
  }
};

export const getMaterialImpact = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const materialImpactEstimate =
      await prisma.materialImpactEstimate.findUnique({
        where: { id: Number(id) },
      });
    if (!materialImpactEstimate) {
      return res.status(404).json({ error: "Impacto no encontrado" });
    }
    res.status(200).json(materialImpactEstimate);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener el impacto" });
  }
};

export const createMaterialImpact = async (req: Request, res: Response) => {
  const { materialType, estimatedCo2SavingsKG, estimatedWaterSavingsLT } =
    req.body;
  try {
    const newMaterialImpact = await prisma.materialImpactEstimate.create({
      data: {
        materialType,
        estimatedCo2SavingsKG,
        estimatedWaterSavingsLT,
      },
    });
    res.status(201).json(newMaterialImpact);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear el impacto" });
  }
};

export const updateMaterialImpact = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { materialType, estimatedCo2SavingsKG, estimatedWaterSavingsLT } =
    req.body;
  try {
    const updatedMaterialImpact = await prisma.materialImpactEstimate.update({
      where: { id: Number(id) },
      data: {
        materialType,
        estimatedCo2SavingsKG,
        estimatedWaterSavingsLT,
      },
    });
    res.status(200).json(updatedMaterialImpact);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar el impacto" });
  }
};

export const deleteMaterialImpact = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.materialImpactEstimate.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar el impacto" });
  }
};

export const bulkCreateMaterialImpacts = async (
  req: Request,
  res: Response
) => {
  const { materialImpacts } = req.body;

  // Validate input
  if (!Array.isArray(materialImpacts) || materialImpacts.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de impactos de materiales no vacío",
    });
  }

  // Validate each material impact object
  const invalidItems: number[] = [];
  const validMaterialImpacts = materialImpacts.filter((matImpact, index) => {
    if (
      !matImpact.materialType ||
      typeof matImpact.materialType !== "string" ||
      matImpact.materialType.trim() === "" ||
      typeof matImpact.estimatedCo2SavingsKG !== "number" ||
      isNaN(matImpact.estimatedCo2SavingsKG) ||
      typeof matImpact.estimatedWaterSavingsLT !== "number" ||
      isNaN(matImpact.estimatedWaterSavingsLT)
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Impactos de materiales inválidos en las filas: ${invalidItems.join(", ")}. Verifique que todos tengan materialType, estimatedCo2SavingsKG y estimatedWaterSavingsLT válidos.`,
    });
  }

  try {
    // Clean and prepare data
    const materialImpactData = validMaterialImpacts.map((matImpact) => ({
      materialType: matImpact.materialType.trim(),
      estimatedCo2SavingsKG: matImpact.estimatedCo2SavingsKG,
      estimatedWaterSavingsLT: matImpact.estimatedWaterSavingsLT,
    }));

    // Check for duplicates in the input (same materialType)
    const materialTypes = materialImpactData.map((d) =>
      d.materialType.toLowerCase()
    );
    const duplicateTypes = materialTypes.filter(
      (type, index) => materialTypes.indexOf(type) !== index
    );

    if (duplicateTypes.length > 0) {
      return res.status(400).json({
        error: `Tipos de materiales duplicados encontrados: ${duplicateTypes.join(", ")}`,
      });
    }

    // Check for existing material types in database
    const existingMaterialImpacts =
      await prisma.materialImpactEstimate.findMany({
        where: {
          materialType: {
            in: materialTypes,
            mode: "insensitive",
          },
        },
      });

    if (existingMaterialImpacts.length > 0) {
      const existingTypes = existingMaterialImpacts.map(
        (d: any) => d.materialType
      );
      return res.status(400).json({
        error: `Los siguientes tipos de materiales ya existen: ${existingTypes.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const createdMaterialImpacts = await tx.materialImpactEstimate.createMany(
        {
          data: materialImpactData,
          skipDuplicates: true,
        }
      );

      // Get the created material impacts to return them
      const newMaterialImpacts = await tx.materialImpactEstimate.findMany({
        where: {
          materialType: {
            in: materialTypes,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          materialType: true,
          estimatedCo2SavingsKG: true,
          estimatedWaterSavingsLT: true,
        },
        orderBy: { materialType: "asc" },
      });

      return {
        count: createdMaterialImpacts.count,
        materialImpacts: newMaterialImpacts,
      };
    });

    res.status(201).json({
      message: `${result.count} impactos de materiales creados exitosamente`,
      count: result.count,
      materialImpacts: result.materialImpacts,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear los impactos de materiales en lote",
    });
  }
};
