import TelegramBot from "node-telegram-bot-api";
import { botToken, inLocal, needTelegramBot } from "../config/constant";
import { Inblounds } from "../sequelize/models";
import { FetchInboundById } from "./inbound";

const options: TelegramBot.ConstructorOptions = { polling: true };

if (inLocal && needTelegramBot) {
  options.request = {
    url: "",
    proxy: `http://localhost:10809`,
  };
}

// const agent = new SocksProxyAgent({
//   hostname: "localhost",
//   port: "1089",
//   type: 5, // socks5
//   protocol: "socks",
// });
// options.request = {
//   url: "",
//   agent,
// };
// https://github.com/hosein2398/node-telegram-bot-api-tutorial

export function runTelegramBot() {
  if (!botToken || botToken !== "") {
    console.log("botToken not found!", botToken);

    return;
  }
  const bot = new TelegramBot(botToken, options);

  // bot.on("message", (msg) => {
  //   console.log("--------msg-------");
  //   console.log(msg);
  //   console.log("------------------");

  //   // bot.sendMessage(msg.chat.id, "hello");
  // });

  // bot.onText(/\/add/, async (msg) => {
  //   console.log("add");
  //   const newInbound = await AddInblound(msg);
  //   bot.sendMessage(msg.chat.id, newInbound);
  //   console.log("--------------");
  // });

  bot.onText(/\/get (.+)/, async (msg, match) => {
    // console.log(match, "match");
    console.log("--------------");

    if (match && match[1]) {
      let res = await FetchInboundById(match[1]);
      bot.sendMessage(msg.chat.id, res);
    }
    console.log("--------------");
  });

  // bot.onText(/\/list/, async (msg) => {
  //   console.log("list");

  //   let list;
  //   try {
  //     // await sequelize.authenticate();

  //     list = await Inblounds.findAll();
  //     // console.log(newInbound);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     // await sequelize.co
  //   }

  //   bot.sendMessage(msg.chat.id, "list");
  //   console.log("--------");
  // });

  bot.on("polling_error", (msg) => console.log(msg));
}
