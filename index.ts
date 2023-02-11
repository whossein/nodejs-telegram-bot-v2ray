import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
// import { appRoute } from "./routes";
import cors from "cors";
import TelegramBot from "node-telegram-bot-api";
import { isTestEnv } from "./config/constant";
import { Inblounds, sequelize } from "./sequelize/models";
import moment from "moment";
import { generateOTP } from "./helper/helper";
import { v4 as uuidv4 } from "uuid";

// import { SocksProxyAgent } from "socks-proxy-agent";

const app: Express = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(__dirname + "/public"));
if (isTestEnv) {
  app.use(errorhandler());
}
app.get("/", (req: Request, res: Response) => {
  return res.send("you can, but you do");
});
// app.use(appRoute);

const token = "6291644750:AAFBLJOkGRYq4o44pt1fiRfvXMQWbfwX7dw";
const options: TelegramBot.ConstructorOptions = { polling: true };

options.request = {
  url: "",
  proxy: `http://localhost:10809`,
};

// const agent = new SocksProxyAgent({
//   hostname: "localhost",
//   port: "10808",
//   type: 5, // socks5
//   protocol: 'socks',
// });
// options.request = {
//   url: '',
//   agent,
// }
// https://github.com/hosein2398/node-telegram-bot-api-tutorial

const bot = new TelegramBot(token, options);

bot.on("message", (msg) => {
  console.log("--------msg-------");
  console.log(msg);
  console.log("------------------");

  // bot.sendMessage(msg.chat.id, "hello");
});

bot.onText(/\/add/, async (msg) => {
  console.log("add");
  bot.sendMessage(msg.chat.id, "در حال ساخت اکانت");
  const newInbound = await AddInblound(msg);
  bot.sendMessage(msg.chat.id, newInbound);
  console.log("--------------");
});

bot.onText(/\/list/, async (msg) => {
  console.log("list");

  let list;
  try {
    // await sequelize.authenticate();

    list = await Inblounds.findAll();
    // console.log(newInbound);
  } catch (error) {
    console.log(error);
  } finally {
    // await sequelize.co
  }

  bot.sendMessage(msg.chat.id, "list");
  console.log("--------");
});

bot.on("polling_error", (msg) => console.log(msg));

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
