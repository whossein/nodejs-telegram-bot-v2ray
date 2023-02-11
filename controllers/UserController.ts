import { Request, Response, NextFunction } from "express";
import { apiResponse } from "../helper/api-response";
import { PrismaClient } from "@prisma/client";
import { generateOTP } from "../helper/helper";
import moment from "moment";
import { isTestEnv } from "../config/constant";
import { sendSmsNormal } from "./SmsController";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const now = new Date().getTime().toString();
  // Check incoming query type
  if (params.model == "User") {
    if (params.action == "delete") {
      // Delete queries
      // Change action to an update
      params.action = "update";
      params.args["data"] = { deleted: now };
    }
    if (params.action == "deleteMany") {
      // Delete many queries
      params.action = "updateMany";
      if (params.args.data != undefined) {
        params.args.data["deleted"] = now;
      } else {
        params.args["data"] = { deleted: now };
      }
    }
  }
  return next(params);
});

const RegisterOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { phoneNumber } = req.body;

    const code = isTestEnv ? 12345 : generateOTP();
    const expireAt = moment().add(2, "m").toISOString();
    const now = moment().toISOString();

    const record = await prisma.userOtp.findFirst({
      where: {
        phoneNumber,
        // isConfirm: false,
      },
    });

    // TODO: replace with sendVerifySMS
    sendSmsNormal("پیامک تستی برای لاگین", phoneNumber, (response, status) => {
      console.log("result: ", response, status);
    });

    if (record) {
      await prisma.userOtp.update({
        where: {
          id: record.id,
        },
        data: {
          code: code.toString(),
          expireAt,
          updatedAt: now,
          try: (record.try | 0) + 1,
          isConfirm: false,
        },
      });
    } else {
      await prisma.userOtp.create({
        data: {
          phoneNumber,
          code: code.toString(),
          expireAt,
          try: 1,
        },
      });
    }

    apiResponse(req, res, {
      status: 200,
      success: true,
      message: "otp sent",
      data: isTestEnv ? code.toString() : null,
    });
  } catch (error) {
    apiResponse(req, res, {
      status: 500,
      success: false,
      message: "register Error",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const LoginOTP = async (req: Request, res: Response, next: NextFunction) => {
  // will be code
  try {
    const { code, phoneNumber } = req.body;

    // check code is ok
    const userOtp = await prisma.userOtp.findFirst({
      where: {
        phoneNumber,
        isConfirm: false,
      },
      include: {
        user: true,
      },
    });

    if (!userOtp) {
      return apiResponse(req, res, { success: false }, ["شناسه ای یافت نشد"]);
    }

    if (userOtp && userOtp.code !== code) {
      return apiResponse(req, res, { success: false }, ["کد صحیح نمی باشد"]);
    }

    console.log(userOtp);

    // create user if is not
    let user = userOtp?.user;
    if (!user && !userOtp.userId) {
      user = await prisma.user.create({
        data: {
          phoneNumber: userOtp.phoneNumber,
        },
      });
    }

    // update try=0, isConfirm: true, user_id
    await prisma.userOtp.update({
      where: {
        id: userOtp?.id,
      },
      data: {
        isConfirm: true,
        try: 0,
        userId: user?.id,
        code: "",
      },
    });

    // generate token
    // store token in DB

    apiResponse(req, res, {
      message: "",
      data: {
        token: "12345",
      },
    });
  } catch (error) {
    console.log(error);

    apiResponse(req, res, {
      status: 500,
      success: false,
      message: "user login Error",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const Create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phoneNumber, nationalCode, userName } =
      req.body;

    if (!(email && phoneNumber && userName)) {
      apiResponse(
        req,
        res,
        {
          success: false,
        },
        ["لطفا یک فیلد userName یا phoneNumber یا email را وارد نمایید"]
      );
    }

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        nationalCode,
      },
    });

    apiResponse(req, res, {
      status: 201,
      success: true,
      message: "user created",
    });
  } catch (error) {
    apiResponse(req, res, {
      status: 500,
      success: false,
      message: "user created Error",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const List = async (req: Request, res: Response, next: NextFunction) => {
  const users = await prisma.user.findMany();

  apiResponse(req, res, {
    data: users,
  });
};

const Update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      nationalCode,
      userName,
      id,
    } = req.body;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        nationalCode,
        userName,
        updatedAt: new Date().getTime().toString(),
      },
    });

    apiResponse(req, res, {
      data: user,
      success: Boolean(user),
      message: "user update",
      status: 200,
    });
  } catch (error) {
    apiResponse(req, res, {
      status: 500,
      success: false,
      message: "user update Error",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const ById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });

    const isSuccess = Boolean(user);

    apiResponse(req, res, {
      data: user,
      success: isSuccess,
      message: ` user ${!isSuccess ? "not" : ""} fetched`,
      status: isSuccess ? 200 : 404,
    });
  } catch (error) {
    apiResponse(req, res, {
      status: 500,
      success: false,
      message: "user fetch Error",
    });
  } finally {
    await prisma.$disconnect();
  }
};

export { List, Create, Update, ById, RegisterOTP, LoginOTP };
