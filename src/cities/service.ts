import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany();
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const city = await prisma.city.findUnique({
      where: { id: Number(id) },
    });
    if (!city) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createCity = async (req: Request, res: Response) => {
  const { city, regionId } = req.body;
  try {
    const newCity = await prisma.city.create({
      data: { city, regionId },
    });
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { city, regionId } = req.body;
  try {
    const updatedCity = await prisma.city.update({
      where: { id: Number(id) },
      data: { city, regionId },
    });
    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.city.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
