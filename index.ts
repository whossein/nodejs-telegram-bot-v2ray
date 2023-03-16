import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import { isTestEnv, needTelegramBot, port } from "./config/constant";
import { runTelegramBot } from "./controllers-bot/bot";
import {
  appendContent,
  createNewContent,
  createUser,
  getNotFinishContent,
} from "./controllers-bot/chat";
import { FetchInboundById } from "./controllers-bot/inbound";

const app: Express = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(__dirname + "/public"));

if (isTestEnv) {
  app.use(errorhandler());
}

app.get("/", async (req: Request, res: Response) => {
  res.send("سرور بالا می باشد");
});

app.get("/chatgpt/create-user", async (req: Request, res: Response) => {
  const result = await createUser("hossein", "aghatabar", "whossein");

  if (result) {
    res.send("کاربر ایجاد شد");
  } else {
    res.send("خطا در ایجاد کاربر");
  }
});

app.get("/chatgpt/create-new-chat", async (req: Request, res: Response) => {
  const result = await createNewContent(12346, "hi, whow are u?", "whossein");

  if (result) {
    res.send("پیام ایجاد شد");
  } else {
    res.send("خطا در ایجاد پیام");
  }
});

app.get("/chatgpt/append-old-chat", async (req: Request, res: Response) => {
  const result = await appendContent(12346, "hi, whow are u?222333");

  if (result) {
    res.send("پیام ایجاد شد");
  } else {
    res.send("خطا در ایجاد پیام");
  }
});

app.get("/chatgpt/get-chat", async (req: Request, res: Response) => {
  const result = await getNotFinishContent(12346);

  if (result) {
    res.send("پیام دریافت شد");
  } else {
    res.send("خطا در دریافت پیام");
  }
});

app.get("/v", async (req: Request, res: Response) => {
  const { uri } = req.query;
  if (!uri || typeof uri !== "string") {
    res.send("آدرس یافت نشد");
    return;
  }

  let result = await FetchInboundById(uri);
  res.send(result);
});

app.get("/t", async (req: Request, res: Response) => {
  const { uri } = req.query;

  if (typeof uri === "string") {
    // const r = await getUriData(uri);

    res.send("r");
    return;
  }

  res.send("آدرس سرور معتبر نمی باشد!");
});

if (needTelegramBot) {
  runTelegramBot();
}

if (!needTelegramBot) {
  app.listen(port, async function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}
