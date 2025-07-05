import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getUserCategories = async (req: Request, res: Response) => {
  try {
    const userCategories = await prisma.userCategory.findMany();
    res.status(200).json(userCategories);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getUserCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userCategory = await prisma.userCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!userCategory) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(userCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
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
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
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
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
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
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
