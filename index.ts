import bodyParser from "body-parser";
import cors from "cors";
import errorhandler from "errorhandler";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import {
  ExampleVless,
  inLocal,
  isTestEnv,
  needTelegramBot,
  port,
} from "./config/constant";
import { getUriData, runTelegramBot } from "./controllers-bot/bot";
import { FetchInboundById } from "./controllers-bot/inbound";
import { getUriObject } from "./helper/helper";

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
    const r = await getUriData(uri);

    res.send(r);
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
