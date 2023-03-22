import TelegramBot from "node-telegram-bot-api";
import { Configuration, OpenAIApi } from "openai";
import {
  botToken,
  inLocal,
  needTelegramBot,
  OpenAIKey,
} from "../config/constant";
import { TMessageType } from "../sequelize/chatgpt";
import {
  appendContent,
  createNewContent,
  createUser,
  getNotFinishContent,
  getUserInfo,
  resetUserContent,
  updateAllowTokens,
  updateUsedToken,
} from "./chat";

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

const commands = ["/start", "/help", "/resetContent", "/buyToken", "/myToken"];

export function runTelegramBot() {
  if (!botToken) {
    console.log("botToken not found!", botToken);
    return;
  }

  const bot = new TelegramBot(botToken, options);

  bot.on("text", async (msg: TelegramBot.Message) => {
    if (commands.some((e) => e === msg.text) || msg.text?.startsWith("/")) {
      return;
    }

    const chatId = msg.chat.id;
    const userName = msg.from?.username;

    if (userName === undefined) {
      bot.sendMessage(chatId, "لطفا برای کاربری خود username تعریف کنید!");

      return;
    }

    if (msg.text === undefined || msg.text.length < 3) {
      bot.sendMessage(chatId, "پیام بسیار کوتاه است");

      return;
    }

    let plsWaitMsg = await bot.sendMessage(chatId, "لطفا صبر کنید...");

    ///////////////// check user limitation
    const user = await getUserInfo(userName);
    const usedTokens = user?.usedTokens || 0;
    const allowTokens = user?.allowTokens || 0;
    const remainingToken = allowTokens - usedTokens;

    if (user && remainingToken < 10) {
      console.log(usedTokens, "usedTokens");
      console.log(allowTokens, "allowTokens");
      console.log(remainingToken, "remainingToken");

      bot.sendMessage(
        chatId,
        `توکن های شما به اتمام رسیده است، برای شارژ آن /buyToken را بزنید`
      );
      return;
    }
    /////////////////////////////

    let result = "نتیجه ای یافت نشد! لطفا بعدا تلاش کنید";

    const userContent = await getNotFinishContent(chatId);

    let content: TMessageType[] = [
      {
        role: "user",
        content: msg.text,
      },
    ];

    if (userContent) {
      // @ts-ignore
      content = [...userContent.content, ...content];
    }

    if (content.length > 15) {
      await resetUserContent(chatId);
    }

    console.log("content for send OpenAi: \n\r", content);

    result = await askOpenAI(content).then(async (r) => {
      bot.deleteMessage(chatId, plsWaitMsg.message_id.toString());

      if (r.success === false) {
        return "خطا در  ارتباط با سرور چت جیپیتی! لطفا بعدا تلاش کنید";
      }

      if (userContent) {
        await appendContent(chatId, msg.text || "", "user");
        await appendContent(chatId, r.content, "assistant");
      } else {
        await createNewContent(
          chatId,
          msg.text || "",
          msg.from?.username || "",
          0
        );
        await appendContent(chatId, r.content, "assistant");
      }

      // console.log("AI: ", r);

      await updateUsedToken(userName, r.usedToken);
      const user = await getUserInfo(userName);
      const usedToken = user?.usedTokens || 0;
      const allowTokens = user?.allowTokens || 0;
      const remainingToken = allowTokens - usedToken;

      // console.log("user: \n\r", user);

      return (
        r.content +
        `\n\r
        
- ممکن است جواب غلط باشد، در صورت اشتباه بودن بهتر است /resetContent را بزنید
- توکن باقی مانده ${remainingToken < 0 ? "نامحدود!" : remainingToken}
- راهنمای بیشتر /help
        `
      );
    });

    // console.log("username: ", msg.from?.username);
    // console.log("name: ", `${msg.from?.first_name} ${msg.from?.last_name}`);
    // console.log("result: ", result);
    console.log("--------------------------------------");

    await bot.sendMessage(chatId, result);

    setTimeout(() => {
      bot.sendMessage(
        chatId,
        `تبلیغات:
  خرید vpn پرسرعت و با قیمتی مناسب
  @brosvpn
      `
      );
    }, 5000);
    //     bot.sendMessage(
    //       chatId,
    //       `
    // - برای ریست کردن کانتنت دستور /resetContent را بزنید
    // - همچنین برای دریافت راهنما /help را بزنید
    // - برای نمایش تبلیغات یا موارد دیگر با ادمین در ارتباط باشید @h03ssein
    //     `
    //     );
  });

  bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
    bot.sendMessage(
      msg.chat.id,
      `با سلام خدمت شما، این یک ربات آزمایشی برای ارتباط با چت جیپیتی از طریق تلگرام می باشد،
 شما میتوانید از این ربات هر سوالی که در ذهن دارید را بپرسید

 تفاوت این ربات با سایت چت جیپیتی، سهولت در استفاده و امکان دسترسی راحتتر و بدون نیاز به ثبت نام می باشد
 برای شروع یک سوال بپرسید یا برای راهنمایی بیشتر /help را بزنید
      
      `
    );
  });

  bot.onText(/\/help/, async (msg: TelegramBot.Message) => {
    bot.sendMessage(
      msg.chat.id,
      `- این یک ربات آزمایشی می باشد و ممکن است هر لحظه به خطا بخورد، اما به دنبال رفع مشکلات احتمالی آن هستیم

- شما مستفیما با ربات چت جیپی صحبت می کنید، پس تمامی جواب ها از سمت سرور openAi دریافت میشود
      
-شما میتوانید از درخواست کدنویسی تا موضوعات مختلف با این ربات صحبت کنید
      
-احتمال اشتباه بودن پاسخ هست 
      
-اگر میخواهید موضوع جدیدی را شروع کنید، دستور /resetContent را بزنید
      
-تقریبا هر پاسخی در نزدیک 1000 توکن مصرف میشود، شما مقدار محدودی توکن دارید 
      
- برای تبلیغات یا موارد دیگر به ادمین ربات @h03ssein پیام دهید 

- در صورت نیاز به توکن بیشتر دستور /buyToken را بزنید

- در صورت نیاز به دریافت مقدار توکن مجاز /myToken را بزنید

      باتشکر`
    );
  });

  bot.onText(/\/resetContent/, async (msg: TelegramBot.Message) => {
    const result = await resetUserContent(msg.chat.id);
    bot.sendMessage(
      msg.chat.id,
      result ? `موضوع ریست شد!` : "خطا در ریست کردن موضوع"
    );
  });

  bot.onText(/\/buyToken/, async (msg: TelegramBot.Message) => {
    bot.sendMessage(
      msg.chat.id,
      `برای خرید توکن، باید بدانید هر 1000 توکن به مبلغ 2هزار تومان می باشد و حداقل خرید 10 هزار توکن می باشد
برای مثال 10هزار توکن 20 هزار تومان می باشد
تقریبا هر سوال و جوابی حدود 1000 توکن مصرف میکند

برای دریافت مقدار توکن باقی مانده دستور /myToken را وارد نمایید
برای دریافت راهنما /help را وارد نمایید

برای خرید توکن باید به شماره کارت زیر مبلغ را واریز نماید و رسید مربوطه به همراه نام کاربری خود (نام کاربری شما: ${
        msg.from?.username || "-"
      }) را برای ادمین ارسال نمایید

ای دی ادمین: @h0ossein

شماره کارت: 6219861904595906
به نام حسین آقاتبار 
      
با تشکر
      `
    );
  });

  bot.onText(/\/myToken/, async (msg: TelegramBot.Message) => {
    const userName = msg.from?.username;
    if (!userName) {
      bot.sendMessage(msg.chat.id, "برای اکانت تلگرام خود نام کاربری ثبت کنید");
      return;
    }

    const user = await getUserInfo(userName);

    if (!user) {
      bot.sendMessage(msg.chat.id, "ابتدا یک سوال بپرسید");
      return;
    }

    const usedToken = user?.usedTokens || 0;
    const allowTokens = user?.allowTokens || 0;
    const remainingToken = allowTokens - usedToken;

    bot.sendMessage(
      msg.chat.id,
      `
      شما مقدار ${usedToken} توکن تا به امروز مصرف کرده اید
      مجاز به ${remainingToken || "نامشخص"} توکن دیگر هستید
      `
    );
  });

  bot.onText(/\/charge (.+)/, async (msg, match) => {
    const userName = msg.from?.username;
    if (!userName) {
      return;
    } else if (userName !== "h03ssein") {
      return;
    }

    const chatId = msg.chat.id;
    //@ts-ignore
    const resp = match[1];

    let [user, amount] = resp.split("-");
    console.log(user, amount);

    const targetUser = await getUserInfo(user);
    if (!targetUser || !amount) {
      bot.sendMessage(chatId, "پیام اشتباه است");
    }

    if (targetUser && amount) {
      const updated = await updateAllowTokens(user, Number(amount));

      bot.sendMessage(
        chatId,
        updated ? `اکانت ${user} ${amount} توکن شارژ شد` : "خطا در شارژ اکانت"
      );
    }
  });

  async function askOpenAI(question: TMessageType[]): Promise<{
    usedToken: number;
    content: string;
    success: boolean;
  }> {
    try {
      const openaiChatResp = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: question,
        temperature: 0,
        max_tokens: 1500,
        top_p: 1,
      });

      // console.log(openaiChatResp.data.choices[0]);

      return {
        // @ts-ignore
        content: openaiChatResp.data.choices[0].message?.content,
        usedToken: openaiChatResp.data.usage?.total_tokens || 0,
        success: true,
      };
    } catch (e) {
      console.log("openAi Error, question: \n\r");
      console.log(question);

      return {
        content: "خطا, لطفا مجددا تلاش کنید!",
        usedToken: 0,
        success: false,
      };
    }
  }

  bot.on("polling_error", (msg) => console.log(msg));
}
