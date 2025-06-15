import Messages from "./messages";

const devModes = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};
export const isTestEnv = true;

export const botToken = "";

export const inLocal = true;
export const needTelegramBot = false;

export const storagePath = inLocal ? "./x-ui.db" : "/etc/x-ui/x-ui.db";

export const ExampleTrojan = "trojan://";
export const ExampleVless = "vless://";

export const port = 733;

export const Environment = {
  development: "development",
  production: "production",
  test: "test",
};

export const Roles = {
  admin: "admin",
  user: "user",
};

export const BotConstants = {
  helpAndroidMessageId: 72,
  helpIosMessageId: 441,
  helpWindowsMessageId: 518,
  MohmmadAdminID: "iambaradaran",
  adminId: "iambaradaran",
  token: "7549398780:AAEfJTtc57Pu8bwR1NEk65xFsmCu5LgE5ww",
  robotName: "چراغ وی‌پی‌ان",
  channelUsername: "@CheraghVPNc",
  supportUsername: "@CheraghVPN",
  adminChatId: 40216705,
  pricePerGb: 4000,
  startKeyboard: {
    reply_markup: {
      keyboard: [
        [{ text: Messages.buyChargeAndAccount }, { text: Messages.myAccounts }],
        [{ text: Messages.help }, { text: Messages.support }],
        // [{ text: Messages.receiveRemainingBalance }], // First row with one button
        // [{ text: Messages.cancel }], // Second row with one button
      ],
      resize_keyboard: true, // Resize the keyboard to fit the buttons
      one_time_keyboard: true, // Hide the keyboard after one use
    },
  },
  v2rayItsOk: "v2rayItsOk",
  v2rayItsNotOk: "v2rayItsNotOk",
  yesItsInvoice: "yesItsInvoice",
  noItsNotInvoice: "noItsNotInvoice",
  confirmUserInvoice: "confirmUserInvoice",
  rejectUserInvoice: "rejectUserInvoice",
  blockUser: "blockUser",

  inquires: "inquires",
  renewal: "renewal",
  emptyAlarmYes: "emptyAlarmYes",
  emptyAlarmNo: "emptyAlarmNo",
  myV2ray: "myV2ray",
  changeLocation: "changeLocation",
};
