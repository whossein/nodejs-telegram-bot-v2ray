export type TUriObj = {
  type: "trojan" | "vless" | "vmess" | null;
  password: string | null;
  url: string | null;
  baseUrl: string | null;
  id: string | null;
  link: string | null;
  remark: string | null;
  port: string | null;
};

function parseUriWithPassword(
  uri: string,
  protocol: string
): {
  password: string;
  url: string;
  remark: string | null;
  port: string | null;
} | null {
  if (uri.startsWith(`${protocol}://`) && uri.includes("@")) {
    const [passwordWithParams, rest] = uri
      .replace(`${protocol}://`, "")
      .split("@");
    const [password, ...params] = passwordWithParams.split("?");
    const remark = extractRemarkFromFragment(uri);

    let port = "";
    if (rest && rest.includes(":")) {
      const [url, portParams] = rest.split(":");
      port = portParams?.includes("?") ? portParams.split("?")[0] : "";
    }

    return {
      password,
      url: rest || "",
      remark,
      port,
    };
  }
  return null;
}

function extractRemarkFromFragment(uri: string): string | null {
  const fragmentIndex = uri.indexOf("#");
  if (fragmentIndex === -1) return null; // No fragment found
  return uri.slice(fragmentIndex + 1); // Extract everything after '#'
}

export function getUriObject(uri: string): TUriObj | undefined {
  const result: TUriObj = {
    type: null,
    password: null,
    url: null,
    baseUrl: null,
    id: null,
    link: uri,
    remark: null,
    port: null,
  };

  if (!uri) {
    return result;
  }

  try {
    if (uri.startsWith("trojan://")) {
      const parsed = parseUriWithPassword(uri, "trojan");
      if (parsed) {
        result.type = "trojan";
        result.password = parsed.password;
        result.url = parsed.url;
        result.remark = parsed.remark;
        result.port = parsed.port;
      }
    } else if (uri.startsWith("vless://")) {
      const parsed = parseUriWithPassword(uri, "vless");
      if (parsed) {
        result.type = "vless";
        result.password = parsed.password;
        result.url = parsed.url;
        result.remark = parsed.remark;
        result.port = parsed.port;
      }
    } else if (uri.startsWith("vmess://")) {
      result.type = "vmess";
      const encodedData = uri.replace("vmess://", "");
      const buff = Buffer.from(encodedData, "base64");
      const text = buff.toString("ascii");
      const data = JSON.parse(text);

      if (typeof data === "object" && data.id && data.add) {
        result.password = data.id;
        result.url = data.add;
        result.remark = data.ps || extractRemarkFromFragment(uri); // Use 'ps' or fragment for VMess
      } else {
        console.error("Invalid VMess URI: Missing id or add property");
      }
    }

    result.id = `${result.password}@${result.url?.split("?")[0] || ""}`;
    result.baseUrl = getBaseUrlFromUri(result.url);
    return result;
  } catch (error) {
    console.error("Error parsing URI:", error);
    return undefined; // Indicate failure to the caller
  }
}

function getBaseUrlFromUri(uri: string | null): string | null {
  if (!uri) {
    return null;
  }

  return uri.split(":")[0];
}
