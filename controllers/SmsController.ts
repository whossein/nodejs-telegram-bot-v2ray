import { KavenegarApi } from "kavenegar";

const apiKey = process.env.KAVE_NEGAR_TOKEN || "not-have";

if (apiKey === "not-have") {
  console.warn("kavenegar not found apikey");
}

const api = KavenegarApi({
  apikey: apiKey,
});

function sendSmsNormal(
  message: string,
  phoneNumbers: string[] | string,
  callBack: (response: any, status: any) => void
) {
  let res;

  api.Send(
    {
      message: message,
      receptor:
        typeof phoneNumbers === "string"
          ? phoneNumbers
          : phoneNumbers.join(","),
    },
    function (response, status) {
      if (callBack instanceof Function) {
        callBack(response, status);
      }
    }
  );
}

function sendVerifySMS(phoneNumber: string, token: string, template: string) {
  api.VerifyLookup(
    {
      receptor: phoneNumber,
      token: token,
      template: template,
    },
    function (response, status) {
      console.log(response);
      console.log(status);
    }
  );
}

export { sendSmsNormal, sendVerifySMS };
