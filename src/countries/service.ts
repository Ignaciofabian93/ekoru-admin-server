import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener ciudades" });
  }
};

export const getCountry = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const country = await prisma.country.findUnique({
      where: { id: Number(id) },
    });
    if (!country) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la ciudad" });
  }
};

export const createCountry = async (req: Request, res: Response) => {
  const { country } = req.body;
  try {
    const newCountry = await prisma.country.create({
      data: { country },
    });
    res.status(201).json(newCountry);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar crear la ciudad" });
  }
};

export const updateCountry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { country } = req.body;
  try {
    const updatedCountry = await prisma.country.update({
      where: { id: Number(id) },
      data: { country },
    });
    res.status(200).json(updatedCountry);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar actualizar la ciudad" });
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.country.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al intentar eliminar la ciudad" });
  }
};
