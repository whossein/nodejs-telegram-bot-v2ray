import { Inblounds, sequelize } from "../sequelize/models";
import moment from "moment";
import { generateOTP } from "../helper/helper";
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
  let trojanPassword = "";
  let result = "";
  let clientObj;

  // console.log("uri", uri);

  if (!uri) {
    return "not uri!";
  }

  const isTrojan = uri.search("trojan://") >= 0;

  // console.log(isTrojan, "isTrojan");

  if (isTrojan && uri.search("@") >= 0) {
    trojanPassword = uri.replace("trojan://", "").split("@")[0];
  } else {
    return "not trojan!";
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // trojan://OLYA6HkKGe@asia.netbros.ir:31690?type=tcp&security=tls#name

    let allData = await Inblounds.findAll();

    allData.forEach((item) => {
      // @ts-ignore
      const s = JSON.parse(item.settings);

      const clients = s.clients;
      // @ts-ignore
      if (isTrojan && clients.find((j) => j.password === trojanPassword)) {
        clientObj = item;
        result = "find!";
      }
    });

    if (!clientObj) {
      result = "not found!";
    }

    if (clientObj) {
      let remainigDays =
        // @ts-ignore
        moment().diff(clientObj?.expiry_time, "d") * -1 + " days";
      //@ts-ignore
      let remainigTotal = clientObj?.total / 1024 / 1024 + " mb";

      result = `
remainig:
${remainigDays}
${remainigTotal}
      `;
    }
  } catch (error) {
    console.log(error);
    return "Error! 500";
  } finally {
    // sequelize.close();
  }

  return result;
};

// function printResult() {
//   return `⬇️ دانلود: ۳۲.۱ گیگابایت
//   ⬆️ آپلود: ۷.۲۱ گیگابایت
//   📦 حجم کل بسته: ۴۰ گیگابایت
//   حجم باقیمانده: ۲۰۰ مگابایت
//   ⏰ زمان: ۱۷ روز مانده`;
// }

export { AddInblound, FetchInboundById };
