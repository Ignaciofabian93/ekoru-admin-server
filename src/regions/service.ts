import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getRegion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const region = await prisma.region.findUnique({
      where: { id: Number(id) },
    });
    if (!region) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createRegion = async (req: Request, res: Response) => {
  const { region, countryId } = req.body;
  try {
    const newRegion = await prisma.region.create({
      data: { region, countryId },
    });
    res.status(201).json(newRegion);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateRegion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { region, countryId } = req.body;
  try {
    const updatedRegion = await prisma.region.update({
      where: { id: Number(id) },
      data: { region, countryId },
    });
    res.status(200).json(updatedRegion);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteRegion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.region.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
