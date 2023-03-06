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
  let msg = await FetchInboundById(ExampleVless);
  console.log(msg);

  res.send(msg);
});

if (needTelegramBot) {
  runTelegramBot();
}

if (inLocal && !needTelegramBot) {
  const port = process.env.PORT || 4000;
  app.listen(process.env.PORT || 4000, async function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}
