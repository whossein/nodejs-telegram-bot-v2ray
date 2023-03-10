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

  // Set up a webhook to receive incoming messages
  bot.on("message", async (msg: TelegramBot.Message) => {
    // Send the message to OpenAI and receive a response

    console.log(msg);

    console.log("--------------------");

    const chat = await bot.getChat(msg.chat.id);
    console.log("chat: ", chat);

    // @ts-ignore
    const response = await askOpenAI(msg.text);

    // Send the OpenAI response back to the user
    bot.sendMessage(msg.chat.id, response);
  });

  async function askOpenAI(question: string): Promise<string> {
    const test = await openai.createChatCompletion({
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

    console.log(test.data);

    // console.log(test.data.choices[0]);

    // @ts-ignore
    return test.data.choices[0].message?.content;

    // Parse the response and return the answer
    const answer =
      // @ts-ignore
      completion?.data?.choices[0]?.text.trim() || "err, pls try again";
    return answer;
  }

  bot.on("polling_error", (msg) => console.log(msg));
}
