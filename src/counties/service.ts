import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getCounties = async (req: Request, res: Response) => {
  try {
    const counties = await prisma.county.findMany({
      orderBy: { county: "asc" },
    });
    res.status(200).json(counties);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener comunas" });
  }
};

export const getCity = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const county = await prisma.county.findUnique({
      where: { id: Number(id) },
    });
    if (!county) {
      return res.status(404).json({ error: "Comuna no encontrada" });
    }
    res.status(200).json(county);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la comuna" });
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
    res.status(500).json({ error: "Error al intentar crear la comuna" });
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
    res.status(500).json({ error: "Error al intentar actualizar la comuna" });
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
    res.status(500).json({ error: "Error al intentar eliminar la comuna" });
  }
};

export const bulkCreateCounties = async (req: Request, res: Response) => {
  const { counties } = req.body;

  // Validate input
  if (!Array.isArray(counties) || counties.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de condados no vacío",
    });
  }

  // Validate each county object
  const invalidItems: number[] = [];
  const validCounties = counties.filter((county, index) => {
    if (
      !county.county ||
      typeof county.county !== "string" ||
      county.county.trim() === "" ||
      !county.cityId ||
      typeof county.cityId !== "number"
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Condados inválidos en las filas: ${invalidItems.join(
        ", "
      )}. Verifique que todos tengan un nombre válido y un cityId.`,
    });
  }

  try {
    // Clean county names and prepare data
    const countyData = validCounties.map((county) => ({
      county: county.county.trim(),
      cityId: county.cityId,
    }));

    // Check for duplicates in the input (same name and cityId combination)
    const countyKeys = countyData.map(
      (d) => `${d.county.toLowerCase()}-${d.cityId}`
    );
    const duplicateKeys = countyKeys.filter(
      (key, index) => countyKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Condados duplicados encontrados`,
      });
    }

    // Verify that all cityIds exist
    const cityIds = [...new Set(countyData.map((d) => d.cityId))];
    const existingCities = await prisma.city.findMany({
      where: {
        id: { in: cityIds },
      },
    });

    const existingCityIds = existingCities.map((d: any) => d.id);
    const invalidCityIds = cityIds.filter(
      (id) => !existingCityIds.includes(id)
    );

    if (invalidCityIds.length > 0) {
      return res.status(400).json({
        error: `Los siguientes cityIds no existen: ${invalidCityIds.join(", ")}`,
      });
    }

    // Check for existing counties in database
    const existingCounties = await prisma.county.findMany({
      where: {
        OR: countyData.map((d) => ({
          county: {
            equals: d.county,
            mode: "insensitive",
          },
          cityId: d.cityId,
        })),
      },
    });

    if (existingCounties.length > 0) {
      const existingNames = existingCounties.map(
        (d: any) => `${d.county} (City ID: ${d.cityId})`
      );
      return res.status(400).json({
        error: `Los siguientes condados ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const createdCounties = await tx.county.createMany({
        data: countyData,
        skipDuplicates: true,
      });

      // Get the created counties to return them
      const newCounties = await tx.county.findMany({
        where: {
          OR: countyData.map((d) => ({
            county: {
              equals: d.county,
              mode: "insensitive",
            },
            cityId: d.cityId,
          })),
        },
        include: {
          city: {
            select: {
              id: true,
              city: true,
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
          },
        },
        orderBy: { county: "asc" },
      });

      return {
        count: createdCounties.count,
        counties: newCounties,
      };
    });

    res.status(201).json({
      message: `${result.count} condados creados exitosamente`,
      count: result.count,
      counties: result.counties,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear los condados en lote",
    });
  }
};
