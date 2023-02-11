import { Request, Response } from "express";
import { validationResult } from "express-validator";

export function apiResponse<dataType = any>(
  req: Request,
  res: Response,
  apiInfo: {
    status?: number;
    data?: dataType | null;
    success?: boolean;
    message?: string;
  },
  customError?: string[]
) {
  const { status = 200, data = null, message = "", success = true } = apiInfo;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  if (customError && customError.length > 0) {
    let customErrorMaped = customError.map((i) => {
      return {
        msg: i,
        param: "other",
      };
    });

    return res.status(400).json({
      success: false,
      errors: customErrorMaped,
    });
  }

  try {
    return res.status(status).json({
      message,
      data,
      success,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Error",
      data: null, // TODO: in dev mode return error message
      success: false,
    });
  }
}
