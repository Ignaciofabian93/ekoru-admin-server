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
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getDepartmentCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const departmentCategory = await prisma.departmentCategory.findUnique({
      where: { id: Number(id) },
    });
    if (!departmentCategory) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(departmentCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
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
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
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
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
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
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
