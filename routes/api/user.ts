import { Router } from "express";
import {
  ById,
  Create,
  List,
  LoginOTP,
  RegisterOTP,
  Update,
} from "../../controllers/UserController";
import {
  AddUserValidation,
  GetUserValidation,
  LoginOtpValidation,
  RegisterOtpValidation,
  UpdateUserValidation,
} from "../../validations/user.validation";

const userRoute = Router();
// "/user"

userRoute.get("/", List);
userRoute.get("/:id", GetUserValidation, ById);
userRoute.post("/", AddUserValidation, Create);
userRoute.put("/", UpdateUserValidation, Update);

// /user/register-otp
userRoute.post("/register-otp", RegisterOtpValidation, RegisterOTP);
// /user/login-otp
userRoute.post("/login-otp", LoginOtpValidation, LoginOTP);

// list -> filter
// delete

export default userRoute;
