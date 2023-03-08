// @ts-nocheck
import TelegramBot from "node-telegram-bot-api";
import { botToken, inLocal, needTelegramBot } from "../config/constant";
import { getUriObject } from "../helper/helper";

const options: TelegramBot.ConstructorOptions = { polling: true };

if (inLocal && needTelegramBot) {
  options.request = {
    url: "",
    proxy: `http://localhost:10809`,
  };
}

export async function getUriData(uri: string) {
  let result;
  if (!uri || typeof uri !== "string") {
    result = "uri not found1";
    return;
  }

  try {
    const uriObj = getUriObject(uri);
    if (!uriObj.url) {
      return "آدرس سرور معتبر نمی باشد!";
    }
    const url = `http://${uriObj.url}:733/v?uri=${uri}`;
    console.log(url);
    const data = await fetch(url).then((r) => {
      let d = r.text();
      console.log(d);
      return d;
    });

    result = data;
  } catch {
    result = "Error";
  }

  return result;
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
  if (!botToken) {
    console.log("botToken not found!", botToken);

    return;
  }
  const bot = new TelegramBot(botToken, options);

  bot.on("message", async (msg) => {
    console.log("-START---------------");
    console.log(msg);
    if (
      (msg.text &&
        (msg.text.search("trojan") >= 0 || msg.text.search("vless") >= 0)) ||
      msg.text.search("vmess") >= 0
    ) {
      let res = await getUriData(msg.text);
      bot.sendMessage(msg.chat.id, res ? res : "Error! :(");
    } else {
      bot.sendMessage(
        msg.chat.id,
        "با سلام، به بات آزمایشی خوش آمدید، لطفا آدرس سرور را بفرستید :)"
      );
    }
    console.log("-END-----------------");

    // bot.sendMessage(msg.chat.id, "hello");
  });

  // Matches /love
  // bot.onText(/\/love/, function onLoveText(msg) {
  //   const opts = {
  //     reply_to_message_id: msg.message_id,
  //     reply_markup: JSON.stringify({
  //       keyboard: [
  //         ["Yes, you are the bot of my life ❤"],
  //         ["No, sorry there is another one..."],
  //       ],
  //     }),
  //   };

  //   // @ts-ignore
  //   bot.sendMessage(msg.chat.id, "Do you love me?", opts);
  // });

  // Matches /editable
  // bot.onText(/\/editable/, function onEditableText(msg) {
  //   const opts = {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [
  //           {
  //             text: "Edit Text",
  //             // we shall check for this value when we listen
  //             // for "callback_query"
  //             callback_data: "edit",
  //           },
  //         ],
  //       ],
  //     },
  //   };

  //   // @ts-ignore
  //   bot.sendMessage(msg.from.id, "Original Text", opts);
  // });

  // Handle callback queries
  // bot.on("callback_query", function onCallbackQuery(callbackQuery) {
  //   const action = callbackQuery.data;
  //   const msg = callbackQuery.message;
  //   const opts = {
  //     chat_id: msg?.chat.id,
  //     message_id: msg?.message_id,
  //   };
  //   let text;

  //   if (action === "edit") {
  //     text = "Edited Text";
  //   }

  //   bot.editMessageText(text, opts);
  // });

  // bot.onText(/\/add/, async (msg) => {

  //   bot.sendMessage(msg.chat.id, "salam");
  //   console.log("--------------");
  // });

  // bot.onText(/\/get (.+)/, async (msg, match) => {
  //   // console.log(match, "match");
  //   console.log("--------------");

  //   if (match && match[1]) {
  //     let res = await FetchInboundById(match[1]);
  //     bot.sendMessage(msg.chat.id, res);
  //   }
  //   console.log("--------------");
  // });

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
