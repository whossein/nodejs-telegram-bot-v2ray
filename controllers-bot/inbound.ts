import { Inblounds, InboundModel, sequelize } from "../sequelize/models";
import moment from "moment";
import {
  byteToUserFirendly,
  generateOTP,
  getUriObject,
} from "../helper/helper";
import { v4 as uuidv4 } from "uuid";
import { SocksProxyAgent } from "socks-proxy-agent";

const AddInblound = async (msg: any) => {
  let result = "error";
  let res;

  try {
    // TODO: check database for unique port
    await sequelize.authenticate();
    const uuid = uuidv4(),
      port = generateOTP();

    const data = {
      remark: `"${msg.chat.id}-username-name-Size"`,
      expiry_time: moment().add(1, "M").valueOf(),
      total: 4 * 1024 * 1024 * 1024,
      port: generateOTP(),
      protocol: "vless",
      settings: {
        clients: [
          {
            id: uuid,
            alterId: 0,
          },
        ],
        disableInsecureEncryption: false,
      },
      stream_settings: {
        network: "tcp",
        security: "none",
        tcpSettings: {
          header: {
            type: "none",
          },
        },
      },
      tag: `inbound-${port}`,
      sniffing: {
        enabled: true,
        destOverride: ["http", "tls"],
      },
    };

    // @ts-ignore
    res = await Inblounds.create(data);
    result = "created!";
  } catch (error) {
    console.log(error);
  } finally {
    sequelize.close();
  }
  console.log(res);

  return result;
};

const FetchInboundById = async function (uri: string) {
  let uriObj = getUriObject(uri);

  if (!uriObj.type || !uriObj.password) {
    return "uri is not valid!";
  }

  let result = "";
  let clientObj: InboundModel | undefined;

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    let allData = await Inblounds.findAll();

    allData.forEach((item: InboundModel) => {
      let settings;

      if (uriObj.type === "trojan" && typeof item.settings === "string") {
        settings = JSON.parse(item.settings);
        const clients = settings.clients;

        if (clients.find((j: any) => j.password === uriObj.password)) {
          clientObj = item;
        }
      }

      if (uriObj.type === "vless" && typeof item.settings === "string") {
        settings = JSON.parse(item.settings);
        const clients = settings.clients;

        if (clients.find((j: any) => j.id === uriObj.password)) {
          clientObj = item;
        }
      }

      if (uriObj.type === "trojan" && typeof item.settings === "string") {
        settings = JSON.parse(item.settings);
        const clients = settings.clients;

        if (clients.find((j: any) => j.id === uriObj.password)) {
          clientObj = item;
        }
      }
    });

    if (!clientObj) {
      result = "uri not found!";
    }

    if (clientObj) {
      result = printResult(clientObj);
    }
  } catch (error) {
    console.log(error);
    return "Error! 500";
  } finally {
    // sequelize.close();
  }

  return result;
};

export function printResult(item: InboundModel): string {
  let result = {
    remainigDay: "",
    upload: "",
    download: "",
    remainingPackage: "",
    totalPackage: "",
  };

  // days
  let remainigDays = moment().diff(item.expiry_time, "d");
  if (remainigDays > 0) {
    result.remainigDay = "اتمام زمان بسته";
  } else {
    result.remainigDay = remainigDays * -1 + " روز مانده";
  }

  if (item.expiry_time.toString() === "0") {
    result.remainigDay = "بدون محدودیت";
  }

  result.totalPackage = byteToUserFirendly(item.total);
  result.download = byteToUserFirendly(item.down);
  result.upload = byteToUserFirendly(item.up);

  let remainigPackageSize = item.total - (item.up + item.down);
  result.remainingPackage = byteToUserFirendly(remainigPackageSize);

  return `⬇️ دانلود: ${result.download}
⬆️ آپلود: ${result.upload}
📦 حجم کل بسته: ${result.totalPackage}
📦 حجم باقیمانده: ${result.remainingPackage} 
⏰ زمان: ${result.remainigDay}`;
}

export { AddInblound, FetchInboundById };
