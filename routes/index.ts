import { Router } from "express";
import { apiRoutes } from "./api";

export const appRoute = Router();

appRoute.use("/", apiRoutes);
