import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { country: "asc" },
    });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener países" });
  }
};

export const getCountry = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const country = await prisma.country.findUnique({
      where: { id: Number(id) },
    });
    if (!country) {
      return res.status(404).json({ error: "País no encontrada" });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener el país" });
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
    res.status(500).json({ error: "Error al intentar crear el país" });
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
    res.status(500).json({ error: "Error al intentar actualizar el país" });
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
    res.status(500).json({ error: "Error al intentar eliminar el país" });
  }
};

export const bulkCreateCountries = async (req: Request, res: Response) => {
  const { countries } = req.body;

  // Validate input
  if (!Array.isArray(countries) || countries.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de países no vacío",
    });
  }

  // Validate each country object
  const invalidItems: number[] = [];
  const validCountries = countries.filter((country, index) => {
    if (
      !country.country ||
      typeof country.country !== "string" ||
      country.country.trim() === ""
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Países inválidos en las filas: ${invalidItems.join(
        ", "
      )}. Verifique que todos tengan un nombre válido.`,
    });
  }

  try {
    // Clean country names and prepare data
    const countryData = validCountries.map((country) => ({
      country: country.country.trim(),
    }));

    // Check for duplicates in the input
    const countryNames = countryData.map((d) => d.country.toLowerCase());
    const duplicateNames = countryNames.filter(
      (name, index) => countryNames.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      return res.status(400).json({
        error: `Países duplicados encontrados: ${duplicateNames.join(", ")}`,
      });
    }

    // Check for existing countries in database
    const existingCountries = await prisma.country.findMany({
      where: {
        country: {
          in: countryNames,
          mode: "insensitive",
        },
      },
    });

    if (existingCountries.length > 0) {
      const existingNames = existingCountries.map((d: any) => d.country);
      return res.status(400).json({
        error: `Los siguientes países ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const createdCountries = await tx.country.createMany({
        data: countryData,
        skipDuplicates: true,
      });

      // Get the created countries to return them
      const newCountries = await tx.country.findMany({
        where: {
          country: {
            in: countryNames,
            mode: "insensitive",
          },
        },
        orderBy: { country: "asc" },
      });

      return {
        count: createdCountries.count,
        countries: newCountries,
      };
    });

    res.status(201).json({
      message: `${result.count} países creados exitosamente`,
      count: result.count,
      countries: result.countries,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear los países en lote",
    });
  }
};
