import { PrismaClient } from "@prisma/client";
import { body, param } from "express-validator";
import moment from "moment";
import { UserType } from "../config/constant";

// can use check with @persian-tools

const prisma = new PrismaClient();

export const checkPhoneNumber = [
  body("phoneNumber")
    .notEmpty()
    .withMessage("شماره موبایل را وارد نمایید")
    .isMobilePhone("fa-IR")
    .withMessage("شماره موبایل را درست وارد نمایید"),
];

const checkUserDataIsValid = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("ایمیل خود را درست وارد نمایید"),
  body("phoneNumber")
    .optional()
    .isMobilePhone("fa-IR")
    .withMessage("شماره موبایل را درست وارد نمایید"),
  body("userName").optional().isString(),
  body("nationalCode")
    .optional()
    .isString()
    .custom((value) => value.length === 10)
    .withMessage("کدملی باید 10 رقم باشد"),
  body("firstName").optional().isString().isLength({ min: 2 }),
  body("lastName").optional().isString().isLength({ min: 3 }),
];
const checkUserUniqueData = [
  body("email").custom((value) => {
    return prisma.user
      .findUnique({
        where: {
          email: value,
        },
      })
      .then((user) => {
        if (user) {
          return Promise.reject("این ایمیل قبلا استفاده شده است");
        }
      })
      .finally(() => {
        prisma.$disconnect();
      });
  }),
  body("phoneNumber").custom((value) => {
    return prisma.user
      .findUnique({
        where: {
          phoneNumber: value,
        },
      })
      .then((user) => {
        if (user) {
          return Promise.reject("این شماره قبلا استفاده شده است");
        }
      })
      .finally(() => {
        prisma.$disconnect();
      });
  }),

  body("nationalCode").custom((value) => {
    return prisma.user
      .findUnique({
        where: {
          nationalCode: value,
        },
      })
      .then((user) => {
        if (user) {
          return Promise.reject("این کدملی قبلا ثبت شده است");
        }
      })
      .finally(() => {
        prisma.$disconnect();
      });
  }),
];

export const AddUserValidation = [
  ...checkUserDataIsValid,
  ...checkUserUniqueData,
];

export const UpdateUserValidation = [
  body("id")
    .not()
    .isEmpty()
    .custom((id) => {
      return prisma.user
        .findUnique({
          where: {
            id: id,
          },
        })
        .then((user) => {
          if (!user) {
            return Promise.reject("کاربری با این شناسه یافت نشد");
          }
        })
        .finally(() => {
          prisma.$disconnect();
        });
    }),
  ...checkUserDataIsValid,
];

export const GetUserValidation = [param("id").not().isEmpty()];

export const RegisterOtpValidation = [
  body("phoneNumber")
    .not()
    .isEmpty()
    .isMobilePhone("fa-IR")
    .custom((phoneNumber) => {
      return prisma.userOtp
        .findFirst({
          where: {
            phoneNumber,
            isConfirm: false,
            expireAt: {
              gte: moment().toISOString(),
            },
          },
          include: {
            user: true,
          },
        })
        .then(async (record) => {
          if (record) {
            const user = record.user;

            // check user is banned
            if (record && user && user.role === UserType.Banned) {
              console.warn(`user ${user.id} is banned,will delete all token's`);
              await prisma.userTokens.deleteMany({
                where: {
                  userId: user.id,
                },
              });
              return Promise.reject("این کاربر محدود شده است");
            }

            // check try
            if (record.try >= 20) {
              if (user && user.id) {
                await prisma.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    ...user,
                    role: UserType.Banned,
                  },
                });
              }

              return Promise.reject("این شماره محدود شده است");
            }

            const expTime = moment(record.expireAt);
            const diff = moment().diff(expTime);
            let diffSeconds = moment.duration(diff).asSeconds();

            if (diffSeconds < 0) {
              diffSeconds *= -1;
            }

            return Promise.reject(
              `تا ${diffSeconds.toFixed()} ثانیه صبر کنید و مجددا تلاش نمایید`
            );
          }
        })
        .finally(() => {
          prisma.$disconnect();
        });
    }),
];

export const LoginOtpValidation = [
  body("phoneNumber").not().isEmpty().isMobilePhone("fa-IR"),
  body("code")
    .not()
    .notEmpty()
    .custom((code) => code.length === 5)
    .withMessage("کد را صحبح ارسال نمایید"),
];
