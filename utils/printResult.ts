import moment from "moment";
import { byteToGigabyte, byteToUserFriendly } from "./byteToUserFriendly";
import { InboundModel } from "../sequelize/models";

export type TInboundRemainingObj = {
  remainingDays: number;
  upload: number;
  download: number;
  remainingPackage: number;
  totalPackage: number;
};

export function getInboundObj(item: InboundModel): TInboundRemainingObj {
  let result: TInboundRemainingObj = {
    remainingDays: 0,
    upload: 0,
    download: 0,
    remainingPackage: 0,
    totalPackage: 0,
  };

  // Handle both expiry_time and expiryTime, ensuring we work with milliseconds
  const expiryTimestamp = item.expiry_time || item.expiryTime;

  // Calculate remaining days from now to expiry
  const now = moment();
  const expiryMoment = moment(expiryTimestamp);
  const diff = expiryMoment.diff(now, "days");

  console.log("Current time:", now.format());
  console.log("Expiry time:", expiryMoment.format());
  console.log("Remaining days:", diff);

  // If expiry is in the future, diff will be positive (remaining days)
  // If expiry is in the past, diff will be negative (expired)
  if (diff < 0) {
    result.remainingDays = 0; // Expired
  } else {
    result.remainingDays = diff;
  }

  if (item.expiry_time?.toString() === "0") {
    result.remainingDays = 999;
  }

  result.totalPackage = byteToGigabyte(item.total);
  result.download = byteToGigabyte(item.down);
  result.upload = byteToGigabyte(item.up);

  let remainigPackageSize = item.total - (item.up + item.down);
  result.remainingPackage = byteToGigabyte(remainigPackageSize);

  return result;
}

export function printInboundResult(item: InboundModel): string {
  const inboundObj = getInboundObj(item);

  // console.log("item::::::::", item);
  // console.log("inboundObj::::::::", inboundObj);

  let result = {
    remainingDay: "",
    upload: "",
    download: "",
    remainingPackage: "",
    totalPackage: "",
  };

  // days
  if (inboundObj.remainingDays === 0) {
    result.remainingDay = "اتمام زمان بسته";
  } else {
    result.remainingDay = inboundObj.remainingDays + " روز مانده";
  }

  if (inboundObj.remainingDays === 999) {
    result.remainingDay = "بدون محدودیت";
  }

  result.totalPackage = byteToUserFriendly(item.total);
  result.download = byteToUserFriendly(item.down);
  result.upload = byteToUserFriendly(item.up);

  // console.log('printResult: ', item.total - (item.down + item.up));
  // console.log('printResult2: ', inboundObj.remainingPackage);

  result.remainingPackage =
    inboundObj.remainingPackage <= 0
      ? " اتمام حجم بسته "
      : inboundObj.remainingPackage + " گیابایت ";

  return `⬇️ دانلود: ${result.download}
⬆️ آپلود: ${result.upload}
📦 حجم کل بسته: ${result.totalPackage}
📦 حجم باقیمانده: ${result.remainingPackage} 
⏰ زمان: ${result.remainingDay}`;
}
