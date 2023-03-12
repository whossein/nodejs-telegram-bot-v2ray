import TelegramBot from "node-telegram-bot-api";
import { Configuration, OpenAIApi } from "openai";
import {
  botToken,
  inLocal,
  needTelegramBot,
  OpenAIKey,
} from "../config/constant";

const options: TelegramBot.ConstructorOptions = { polling: true };

const configuration = new Configuration({
  apiKey: OpenAIKey,
});
const openai = new OpenAIApi(configuration);

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
  if (!botToken) {
    console.log("botToken not found!", botToken);
    return;
  }

  const bot = new TelegramBot(botToken, options);

  bot.on("text", async (msg: TelegramBot.Message) => {
    let plsWaitMsg = await bot.sendMessage(msg.chat.id, "لطفا صبر کنید...");

    console.log("username: ", msg.from?.username);
    console.log("name: ", `${msg.from?.first_name} ${msg.from?.last_name}`);
    console.log("user: ", msg.text);

    // @ts-ignore
    const response = await askOpenAI(msg.text).then((r) => {
      bot.deleteMessage(msg.chat.id, plsWaitMsg.message_id.toString());
      console.log("AI: ", r);
      console.log("---------------------");

      return r;
    });

    bot.sendMessage(msg.chat.id, response);
  });

  async function askOpenAI(question: string): Promise<string> {
    try {
      const openaiChatResp = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
      });

      // @ts-ignore
      return openaiChatResp.data.choices[0].message?.content;
    } catch (e) {
      return "خطا, لطفا مجددا تلاش کنید!";
    }
  }

  bot.on("polling_error", (msg) => console.log(msg));
}
