import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getMaterialImpacts = async (req: Request, res: Response) => {
  try {
    const userCategories = await prisma.materialImpactEstimate.findMany();
    res.status(200).json(userCategories);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
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
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(materialImpactEstimate);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
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
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
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
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
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
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
