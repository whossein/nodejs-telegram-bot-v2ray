import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import express, { Express, Response, Request } from "express";
import morgan from "morgan";
// import { appRoute } from "./routes";
import cors from "cors";
import {
  ExampleTrojan,
  ExampleVless,
  inLocal,
  isTestEnv,
  needTelegramBot,
} from "./config/constant";
import { runTelegramBot } from "./controllers-bot/bot";
import { FetchInboundById } from "./controllers-bot/inbound";

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

app.get("/", async (req: Request, res: Response) => {
  let msg = await FetchInboundById(ExampleVless);
  console.log(msg);

  res.send(msg);
});
// app.use(appRoute);

if (needTelegramBot) {
  runTelegramBot();
}

if (inLocal && !needTelegramBot) {
  const port = process.env.PORT || 4000;
  app.listen(process.env.PORT || 4000, async function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

    // const res = await FetchInboundById(ExampleTrojan);

    // console.log(res);
  });
}
