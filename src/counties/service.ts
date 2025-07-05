import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCounties = async (req: Request, res: Response) => {
  try {
    const counties = await prisma.county.findMany();
    res.status(200).json(counties);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const county = await prisma.county.findUnique({
      where: { id: Number(id) },
    });
    if (!county) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(county);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createCity = async (req: Request, res: Response) => {
  const { county, cityId } = req.body;
  try {
    const newCity = await prisma.county.create({
      data: { county, cityId },
    });
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { county, cityId } = req.body;
  try {
    const updatedCity = await prisma.county.update({
      where: { id: Number(id) },
      data: { county, cityId },
    });
    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.county.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
