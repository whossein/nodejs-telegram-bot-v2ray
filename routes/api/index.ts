import { Router } from "express";
import userRoute from "./user";

export const apiRoutes = Router();
// "/"

apiRoutes.use("/user", userRoute);
