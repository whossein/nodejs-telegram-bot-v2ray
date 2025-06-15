import { Request, Response } from "express";
import httpStatus from "http-status";
import { InboundModel } from "../sequelize/models";
import { getPanelConfigByBaseUrl } from "../services/panelConfig.service";
import { updateOrCreateV2ray } from "../services/v2ray.service";
import { getAllInbounds, getRemainingFromUri } from "../services/xui.service";
import { ApiError, catchAsync } from "../utils";
import { getUriObject } from "../utils/uri";
import { getInboundObj } from "../utils/printResult";

export const getInbounds = catchAsync(async (req: Request, res: Response) => {
  const { uri } = req.query;

  if (!uri || typeof uri !== "string") {
    res.send("uri is not valid");
    return;
  }

  if (req) {
    let uriObj = getUriObject(uri);

    // const r = await getRemainingByUri(uri, 'web');

    res.send(uriObj);
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, "User Id not found");
  }
});

export async function getRemainingByUri(
  uri: string
): Promise<null | InboundModel> {
  let uriObj = getUriObject(uri);

  if (uriObj?.baseUrl && typeof uriObj.baseUrl === "string") {
    const panel = await getPanelConfigByBaseUrl(uriObj.baseUrl);

    if (panel && panel.baseUrl && panel.username && panel.password) {
      const inbounds = await getAllInbounds({
        baseUrl: panel.baseUrl,
        username: panel.username as string,
        password: panel.password as string,
      });

      if (inbounds) {
        const result = getRemainingFromUri(inbounds, uriObj);
        if (result) {
          const inboundObj = getInboundObj(result);

          // console.log(inboundObj, "inboundObj");

          // const v2ray = await updateOrCreateV2ray({
          //   link: uri,
          //   idUrl: uriObj.id as string,
          //   expire_date: new Date(result.expiry_time * 1000), // Convert to Date
          //   volume_gb: inboundObj.totalPackage,
          //   remaining_volume_mb: inboundObj.remainingPackage * 1024,
          //   is_active: result.enable,
          //   is_expired: inboundObj.remainingDays <= 0,
          //   user_id: [user_id], // This will be converted to JSON string by the model setter
          //   baseUrl: panel.baseUrl,
          //   password: uriObj.password || "",
          //   port: uriObj.port || "",
          // } as any);

          // if (!v2ray) {
          //   console.log("V2ray not create!");
          // }
        }

        return result;
      } else {
        console.log("Inbounds not found");
        return null;
      }
    } else {
      console.log("Panel not found1");
      return null;
    }
  } else {
    console.log("uriObj is not valid");
    return null;
  }
}
