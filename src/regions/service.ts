import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { region: "asc" },
    });
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener regiones" });
  }
};

export const getRegion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const region = await prisma.region.findUnique({
      where: { id: Number(id) },
    });
    if (!region) {
      return res.status(404).json({ error: "Region no encontrada" });
    }
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener la region" });
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
    res.status(500).json({ error: "Error al intentar crear la region" });
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
    res.status(500).json({ error: "Error al intentar actualizar la region" });
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
    res.status(500).json({ error: "Error al intentar eliminar la region" });
  }
};

export const bulkCreateRegions = async (req: Request, res: Response) => {
  const { regions } = req.body;

  // Validate input
  if (!Array.isArray(regions) || regions.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de regiones no vacío",
    });
  }

  // Validate each region object
  const invalidItems: number[] = [];
  const validRegions = regions.filter((region, index) => {
    if (
      !region.region ||
      typeof region.region !== "string" ||
      region.region.trim() === "" ||
      !region.countryId ||
      typeof region.countryId !== "number"
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Regiones inválidas en las filas: ${invalidItems.join(
        ", "
      )}. Verifique que todas tengan un nombre válido y un countryId.`,
    });
  }

  try {
    // Clean region names and prepare data
    const regionData = validRegions.map((region) => ({
      region: region.region.trim(),
      countryId: region.countryId,
    }));

    // Check for duplicates in the input (same name and countryId combination)
    const regionKeys = regionData.map(
      (d) => `${d.region.toLowerCase()}-${d.countryId}`
    );
    const duplicateKeys = regionKeys.filter(
      (key, index) => regionKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      return res.status(400).json({
        error: `Regiones duplicadas encontradas`,
      });
    }

    // Verify that all countryIds exist
    const countryIds = [...new Set(regionData.map((d) => d.countryId))];
    const existingCountries = await prisma.country.findMany({
      where: {
        id: { in: countryIds },
      },
    });

    const existingCountryIds = existingCountries.map((d) => d.id);
    const invalidCountryIds = countryIds.filter(
      (id) => !existingCountryIds.includes(id)
    );

    if (invalidCountryIds.length > 0) {
      return res.status(400).json({
        error: `Los siguientes countryIds no existen: ${invalidCountryIds.join(", ")}`,
      });
    }

    // Check for existing regions in database
    const existingRegions = await prisma.region.findMany({
      where: {
        OR: regionData.map((d) => ({
          region: {
            equals: d.region,
            mode: "insensitive",
          },
          countryId: d.countryId,
        })),
      },
    });

    if (existingRegions.length > 0) {
      const existingNames = existingRegions.map(
        (d) => `${d.region} (Country ID: ${d.countryId})`
      );
      return res.status(400).json({
        error: `Las siguientes regiones ya existen: ${existingNames.join(", ")}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdRegions = await tx.region.createMany({
        data: regionData,
        skipDuplicates: true,
      });

      // Get the created regions to return them
      const newRegions = await tx.region.findMany({
        where: {
          OR: regionData.map((d) => ({
            region: {
              equals: d.region,
              mode: "insensitive",
            },
            countryId: d.countryId,
          })),
        },
        include: {
          country: {
            select: {
              id: true,
              country: true,
            },
          },
        },
        orderBy: { region: "asc" },
      });

      return {
        count: createdRegions.count,
        regions: newRegions,
      };
    });

    res.status(201).json({
      message: `${result.count} regiones creadas exitosamente`,
      count: result.count,
      regions: result.regions,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear las regiones en lote",
    });
  }
};
