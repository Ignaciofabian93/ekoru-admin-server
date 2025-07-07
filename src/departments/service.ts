import { Request, Response } from "express";
import prisma from "../client/prisma";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { departmentName: "asc" },
    });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: "Error al intentar obtener departamentos" });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });
    if (!department) {
      return res.status(404).json({ error: "Departamento no encontrada" });
    }
    res.status(200).json(department);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al intentar obtener el departamento" });
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
    res.status(500).json({ error: "Error al intentar crear el departamento" });
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
    res
      .status(500)
      .json({ error: "Error al intentar actualizar el departamento" });
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
    res
      .status(500)
      .json({ error: "Error al intentar eliminar el departamento" });
  }
};

export const bulkCreateDepartments = async (req: Request, res: Response) => {
  const { departments } = req.body;

  // Validate input
  if (!Array.isArray(departments) || departments.length === 0) {
    return res.status(400).json({
      error: "Se requiere un array de departamentos no vacío",
    });
  }

  // Validate each department object
  const invalidItems: number[] = [];
  const validDepartments = departments.filter((dept, index) => {
    if (
      !dept.departmentName ||
      typeof dept.departmentName !== "string" ||
      dept.departmentName.trim() === ""
    ) {
      invalidItems.push(index + 1);
      return false;
    }
    return true;
  });

  if (invalidItems.length > 0) {
    return res.status(400).json({
      error: `Departamentos inválidos en las filas: ${invalidItems.join(
        ", "
      )}. Verifique que todos tengan un nombre válido.`,
    });
  }

  try {
    // Clean department names and prepare data
    const departmentData = validDepartments.map((dept) => ({
      departmentName: dept.departmentName.trim(),
    }));

    // Check for duplicates in the input
    const departmentNames = departmentData.map((d) =>
      d.departmentName.toLowerCase()
    );
    const duplicateNames = departmentNames.filter(
      (name, index) => departmentNames.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      return res.status(400).json({
        error: `Departamentos duplicados encontrados: ${duplicateNames.join(", ")}`,
      });
    }

    // Check for existing departments in database
    const existingDepartments = await prisma.department.findMany({
      where: {
        departmentName: {
          in: departmentNames,
          mode: "insensitive",
        },
      },
    });

    if (existingDepartments.length > 0) {
      const existingNames = existingDepartments.map(
        (d: any) => d.departmentName
      );
      return res.status(400).json({
        error: `Los siguientes departamentos ya existen: ${existingNames.join(
          ", "
        )}`,
      });
    }

    // Perform bulk insert using transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const createdDepartments = await tx.department.createMany({
        data: departmentData,
        skipDuplicates: true,
      });

      // Get the created departments to return them
      const newDepartments = await tx.department.findMany({
        where: {
          departmentName: {
            in: departmentNames,
            mode: "insensitive",
          },
        },
        orderBy: { departmentName: "asc" },
      });

      return {
        count: createdDepartments.count,
        departments: newDepartments,
      };
    });

    res.status(201).json({
      message: `${result.count} departamentos creados exitosamente`,
      count: result.count,
      departments: result.departments,
    });
  } catch (error) {
    console.error("Error en bulk insert:", error);
    res.status(500).json({
      error: "Error al intentar crear los departamentos en lote",
    });
  }
};
