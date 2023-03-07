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
import { runTelegramBot } from "./controllers-bot/bot";
import { FetchInboundById } from "./controllers-bot/inbound";

const app: Express = express();

app.use(cors());
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
    res.send("uri not found1");
    return;
  }
  let result = await FetchInboundById(uri);
  res.send(result);
});

if (needTelegramBot) {
  runTelegramBot();
}

if (!needTelegramBot) {
  app.listen(port, async function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}
