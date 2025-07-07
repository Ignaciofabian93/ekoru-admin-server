import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { city: "asc" },
    });
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

export const bulkCreateCities = async (req: Request, res: Response) => {
  const { cities } = req.body;

  // Validate input
  if (!Array.isArray(cities) || cities.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de ciudades no vacío",
    });
  }

  // Validate each city object
  const invalidItems: number[] = [];
  const validCities = cities.filter((city, index) => {
    if (
      !city.city ||
      typeof city.city !== "string" ||
      city.city.trim() === "" ||
      !city.regionId ||
      typeof city.regionId !== "number"
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Ciudades inválidas en las filas: ${invalidItems.join(
        ", "
      )}. Verifique que todas tengan un nombre válido y un regionId.`,
    });
  }

  try {
    // Clean city names and prepare data
    const cityData = validCities.map((city) => ({
      city: city.city.trim(),
      regionId: city.regionId,
    }));

    // Check for duplicates in the input (same name and regionId combination)
    const cityKeys = cityData.map(
      (d) => `${d.city.toLowerCase()}-${d.regionId}`
    );
    const duplicateKeys = cityKeys.filter(
      (key, index) => cityKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Ciudades duplicadas encontradas`,
      });
    }

    // Verify that all regionIds exist
    const regionIds = [...new Set(cityData.map((d) => d.regionId))];
    const existingRegions = await prisma.region.findMany({
      where: {
        id: { in: regionIds },
      },
    });

    const existingRegionIds = existingRegions.map((d) => d.id);
    const invalidRegionIds = regionIds.filter(
      (id) => !existingRegionIds.includes(id)
    );

    if (invalidRegionIds.length > 0) {
      return res.status(400).json({
        error: `Los siguientes regionIds no existen: ${invalidRegionIds.join(", ")}`,
      });
    }

    // Check for existing cities in database
    const existingCities = await prisma.city.findMany({
      where: {
        OR: cityData.map((d) => ({
          city: {
            equals: d.city,
            mode: "insensitive",
          },
          regionId: d.regionId,
        })),
      },
    });

    if (existingCities.length > 0) {
      const existingNames = existingCities.map(
        (d) => `${d.city} (Region ID: ${d.regionId})`
      );
      return res.status(400).json({
        error: `Las siguientes ciudades ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdCities = await tx.city.createMany({
        data: cityData,
        skipDuplicates: true,
      });

      // Get the created cities to return them
      const newCities = await tx.city.findMany({
        where: {
          OR: cityData.map((d) => ({
            city: {
              equals: d.city,
              mode: "insensitive",
            },
            regionId: d.regionId,
          })),
        },
        include: {
          region: {
            select: {
              id: true,
              region: true,
              country: {
                select: {
                  id: true,
                  country: true,
                },
              },
            },
          },
        },
        orderBy: { city: "asc" },
      });

      return {
        count: createdCities.count,
        cities: newCities,
      };
    });

    res.status(201).json({
      message: `${result.count} ciudades creadas exitosamente`,
      count: result.count,
      cities: result.cities,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear las ciudades en lote",
    });
  }
};
