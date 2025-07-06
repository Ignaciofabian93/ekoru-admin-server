import { Request, Response } from "express";
import { compare } from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma from "../client/prisma";
import { ENVIRONMENT } from "../config/environment";
import { hash, genSalt } from "bcrypt";

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const formattedEmail = email.toLowerCase();
  const user = await prisma.admin.findUnique({
    where: { email: formattedEmail },
  });
  if (!user) {
    res.status(400).json({ error: "No se encontró al usuario" });
    return;
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    res.status(400).json({ message: "Credenciales inválidas" });
    return;
  }
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15min" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
  res.cookie("token", token, {
    httpOnly: ENVIRONMENT === "production" ? true : false,
    secure: ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: ENVIRONMENT === "production" ? true : false,
    secure: ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
  });
  res.json({
    token,
    message: "Inicio de sesión exitoso",
    email: user.email,
    name: user.name,
    id: user.id,
  });
};

export const RefreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No se pudo generar un nuevo token de acceso" });
  }
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;
    const newToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    res.cookie("token", newToken, {
      httpOnly: ENVIRONMENT === "production" ? true : false,
      secure: ENVIRONMENT === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
    });
    res.json({ token: newToken, success: true });
  } catch {
    res.status(401).json({ message: "Token de acceso inválido" });
  }
};

export const Profile = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // Access userId from JWT payload
  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }
  const user = await prisma.admin.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  res.json(user);
};

export const CreateUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const formattedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: formattedEmail },
  });
  if (existingUser) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const newUser = await prisma.admin.create({
    data: {
      email: formattedEmail,
      password: hashedPassword,
      name,
    },
  });
  res
    .status(201)
    .json({ message: "Usuario creado exitosamente", userId: newUser.id });
};
