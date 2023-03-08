function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateOTP() {
  return getRandomInt(10_000, 99_999);
}

type TUriResult = {
  type: "vless" | "trojan" | "vmess" | null;
  password: string | null;
  url: string | null;
};

export function getUriObject(uri: string): TUriResult {
  let result: TUriResult = {
    type: null,
    password: null,
    url: null,
  };

  if (!uri) {
    return result;
  }

  if (uri.substring(0, 9) === "trojan://" && uri.search("@") >= 0) {
    result.type = "trojan";
    let splitted = uri.replace("trojan://", "").split("@");
    result.password = splitted[0];
    result.url = splitted[1] ? splitted[1].split(":")[0] : null;
  }

  if (uri.substring(0, 8) === "vless://" && uri.search("@") >= 0) {
    result.type = "vless";
    let splitted = uri.replace("vless://", "").split("@");
    result.password = splitted[0];
    result.url = splitted[1] ? splitted[1].split(":")[0] : null;
  }

  if (uri.substring(0, 8) === "vmess://") {
    result.type = "vmess";

    let encodedData = uri.replace("vmess://", "");
    let buff = Buffer.from(encodedData, "base64");
    let text = buff.toString("ascii");
    let data = JSON.parse(text);

    if (typeof data === "object" && data["id"] && data["add"]) {
      result.password = data["id"];
      result.url = data["add"];
    }
  }

  return result;
}

export function byteToUserFirendly(amount: number): string {
  let result = "";
  const oneMB = 1024 * 1024;
  const oneGB = 1024 * 1024 * 1024;

  if (amount < oneMB) {
    result = "کمتر از یک مگابایت";
  } else if (amount < oneGB) {
    let num = amount / oneMB;
    result = num.toFixed(2) + " مگابایت";
  } else {
    let num = amount / oneGB;
    result = num.toFixed(2) + " گیگابایت";
  }

  return result;
}
