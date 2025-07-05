import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });
    if (!department) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  const { departmentName } = req.body;
  try {
    const newDepartment = await prisma.department.create({
      data: { departmentName },
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { departmentName } = req.body;
  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: Number(id) },
      data: { departmentName },
    });
    res.status(200).json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
