import axios, { AxiosInstance, AxiosResponse } from "axios";
import https from "https";
import { InboundModel, V2ray } from "../sequelize/models";
import { getUriObject, TUriObj } from "../utils/uri";
import formData from "form-data";
import { v4 as uuidv4 } from "uuid";
import { getPanelConfigByBaseUrl } from "./panelConfig.service";
import {
  generateClientUri,
  generateRandomString,
  generateUniquePort,
  getExpireDate,
} from "../utils/helper";
import { getInboundObj } from "../utils/printResult";
import { BotConstants } from "../config/constant";
import {
  getActivePanelConfig,
  getAllPanelConfigs,
} from "./panelConfig.service";

// Dynamic base URL - will be fetched from database
// TODO: implement load balancing and failover logic
export async function getDynamicBaseUrl(): Promise<string | null> {
  try {
    const panel = await getActivePanelConfig();
    // Ensure panel is active before returning baseUrl
    if (panel && panel.isActive) {
      return panel.baseUrl || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting dynamic base URL:", error);
    return null;
  }
}

// Get base hostname for port checking (without protocol and path)
export async function getBaseHostname(): Promise<string> {
  try {
    const baseUrl = await getDynamicBaseUrl();
    if (baseUrl) {
      // Extract hostname from URL (remove protocol and path)
      const url = new URL(baseUrl);
      return url.hostname;
    }
    // Fallback to localhost if no panel is available
    return "localhost";
  } catch (error) {
    console.error("Error getting base hostname:", error);
    return "localhost";
  }
}

// Utility function to test panel connectivity
async function testPanelHealth(panel: TPanelConfigData): Promise<boolean> {
  try {
    const cookies = await login(panel);
    return cookies.length > 0;
  } catch (error) {
    console.error(`Panel health check failed for ${panel.baseUrl}:`, error);
    return false;
  }
}

// Get panel with failover support
export async function getPanelWithFailover(): Promise<TPanelConfigData | null> {
  try {
    // First try to get the primary active panel
    let panel = await getActivePanelConfig();

    if (panel && panel.isActive) {
      const panelData: TPanelConfigData = {
        baseUrl: panel.baseUrl || "",
        password: panel.password || "",
        username: panel.username || "",
      };

      // Test if primary panel is healthy
      const isHealthy = await testPanelHealth(panelData);
      if (isHealthy) {
        return panelData;
      }

      console.log(
        `Primary panel ${panel.baseUrl} is unhealthy, trying alternatives...`
      );
    }

    // If primary fails, get all active panels and try them
    const allPanels = await getAllPanelConfigs();
    const activePanels = allPanels.filter((p: any) => p.isActive === true);

    for (const altPanel of activePanels) {
      const altPanelData: TPanelConfigData = {
        baseUrl: altPanel.baseUrl || "",
        password: altPanel.password || "",
        username: altPanel.username || "",
      };

      const isHealthy = await testPanelHealth(altPanelData);
      if (isHealthy) {
        console.log(`Using fallback panel: ${altPanel.baseUrl}`);
        return altPanelData;
      }
    }

    console.error("No healthy panels available");
    return null;
  } catch (error) {
    console.error("Error in panel failover:", error);
    return null;
  }
}

interface LoginResponse {
  message?: string;
  error?: string;
}

const axiosInstance: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignore SSL errors
});

export type TPanelConfigData = {
  baseUrl: string;
  username: string;
  password: string;
};

async function login(data: TPanelConfigData): Promise<string[]> {
  try {
    const panelUrl = data.baseUrl + "login";
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      panelUrl,
      {
        username: data.username,
        password: data.password,
      }
    );

    // Extract cookies or session tokens from the response
    const cookies: string[] = response.headers["set-cookie"] || []; // Ensure it's always an array
    if (cookies.length === 0) {
      throw new Error("Login failed: No session cookies received");
    }

    // console.log('Login successful!');
    return cookies; // Return the session cookies
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Login failed:", error.response?.data || error.message);
    } else {
      console.error("Login failed:", error);
    }
    throw error;
  }
}

export async function getAllInbounds(data: TPanelConfigData) {
  try {
    const cookies: string[] = await login(data);

    const inbounds: any = await makeAuthenticatedRequest<any>(
      cookies,
      `panel/api/inbounds/list`,
      data.baseUrl
    );

    return inbounds?.obj;
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
  }
}

async function makeAuthenticatedRequest<T>(
  cookies: string[],
  endpoint: string,
  baseUrl: string
): Promise<T> {
  try {
    const url = `${baseUrl}${endpoint}`;
    const response: AxiosResponse<T> = await axiosInstance.get(url, {
      headers: {
        Cookie: cookies.join("; "), // Attach the session cookies
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "API request failed:",
        error.response?.data || error.message
      );
    } else {
      console.error("API request failed:", error);
    }
    throw error;
  }
}

export function getRemainingFromUri(
  allData: InboundModel[],
  uriObj: TUriObj
): InboundModel | null {
  let clientObj: InboundModel | null = null;
  let result: InboundModel | null = null;

  allData.forEach((item: InboundModel) => {
    let settings;

    if (uriObj.type === "trojan" && typeof item.settings === "string") {
      settings = JSON.parse(item.settings);
      const clients = settings.clients;

      if (clients?.find((j: any) => j.password === uriObj.password)) {
        clientObj = item;
      }
    }

    if (uriObj.type === "vless" && typeof item.settings === "string") {
      settings = JSON.parse(item.settings);
      const clients = settings.clients;

      if (clients?.find((j: any) => j.id === uriObj.password)) {
        clientObj = item;
      }
    }

    if (uriObj.type === "vmess" && typeof item.settings === "string") {
      settings = JSON.parse(item.settings);
      const clients = settings.clients;

      if (clients.find((j: any) => j.id === uriObj.password)) {
        clientObj = item;
      }
    }
  });

  if (!clientObj) {
    // result = 'clientObj not found!';
    result = null;
  }

  if (clientObj) {
    result = clientObj; //printResult(clientObj);
  }

  return result;
}

export const addInbound = async (
  chatId: string,
  value: number,
  expireDays: number = 180,
  itsTest = true,
  adminUserName: string = BotConstants.adminId
) => {
  try {
    // Get panel configuration with failover support
    const panelData = await getPanelWithFailover();
    if (!panelData || !panelData.baseUrl) {
      console.log("No healthy panel configuration found");
      return;
    }

    const cookies: string[] = await login(panelData);
    const d: IGetInboundFormDataInput = {
      chatId,
      value,
      itsTest,
      expireDays: expireDays,
    };
    const form = await getInboundFormData(d);
    const response = await axios.post(
      `${panelData.baseUrl}/panel/inbound/add`,
      form,
      {
        headers: {
          Cookie: cookies.join("; "),
          ...form.getHeaders(), // Include form-data headers
        },
      }
    );

    // console.log('Inbound added successfully:', response.data);

    // v2ray
    const link = generateClientUri(
      response.data,
      new URL(panelData.baseUrl).hostname
    );

    let uriObj = getUriObject(link);

    const v2rayDB = await V2ray.create({
      user_id: [chatId], // Store as array
      link: link,
      expire_date: getExpireDate(expireDays),
      volume_gb: value,
      remaining_volume_mb: value,
      is_active: true,
      is_expired: false,
      title: form.getHeaders()["remark"],
      idUrl: uriObj?.id || "",
      admin_id: adminUserName,
      baseUrl: panelData.baseUrl,
      password: uriObj?.password || "",
      port: uriObj?.port || "",
    } as any);

    return v2rayDB;
  } catch (error) {
    console.error("Error adding inbound:", error);
  }
};

export interface IUpdateInbound {
  configLink: string;
  remark: string;
  chatId: string;
  value: number;
  expireDays?: number;
  adminUserName?: string;
  isEnable?: "true" | "false";
  existsData?: boolean;
  itsTest: boolean;
  itsExtraValue?: boolean;
  chatIdArray?: string[];
  port: string;
}

export const updateInbound = async (payload: IUpdateInbound) => {
  const {
    configLink,
    remark,
    chatId,
    value,
    expireDays = 180,
    adminUserName = BotConstants.adminId,
    isEnable = "true",
    existsData = true,
    itsTest = true,
    itsExtraValue = false,
    chatIdArray = [],
    port,
  } = payload;

  try {
    // Get panel configuration with failover support
    const panelData = await getPanelWithFailover();
    if (!panelData || !panelData.baseUrl) {
      console.log("No healthy panel configuration found");
      return;
    }

    const allInbounds: InboundModel[] = await getAllInbounds(panelData);
    const inbound = allInbounds.find((i) => i.remark === remark);

    if (!inbound) {
      console.log("inbound not found!");
      return;
    }

    const inboundObj = getInboundObj(inbound);

    const cookies: string[] = await login(panelData);
    const d: IGetInboundFormDataInput = {
      chatId,
      value: existsData
        ? itsExtraValue
          ? Number(value)
          : Number(value + inboundObj.remainingPackage)
        : Number(value),
      expireDays: existsData
        ? itsExtraValue
          ? expireDays
          : expireDays + inboundObj.remainingDays
        : expireDays,

      itsTest,
      isEnable,
      port,
    };
    const form = await getInboundFormData(d);
    const response = await axios.post(
      `${panelData.baseUrl}/panel/inbound/update/${inbound?.id}`,
      form,
      {
        headers: {
          Cookie: cookies.join("; "),
          ...form.getHeaders(), // Include form-data headers
          // Authorization: 'Bearer YOUR_API_KEY', // Replace with your actual API key if required
        },
      }
    );
    let uriObj = getUriObject(configLink);

    try {
      // Convert MongoDB-style filter to Sequelize where clause
      const whereClause = {
        link: configLink,
        // Note: For user_id search in JSON array, we'll need to use raw SQL or alternative approach
        // For now, we'll just search by link since user_id is stored as JSON
      };

      const data = {
        expire_date: getExpireDate(expireDays),
        volume_gb: value,
        remaining_volume_mb: value,
        is_active: false,
        is_expired: false,
        title: uriObj?.remark,
        idUrl: uriObj?.id || "",
        admin_id: adminUserName,
        port: port || "",
        user_id:
          chatIdArray && Array.isArray(chatIdArray) && chatIdArray.length > 0
            ? chatIdArray
            : [chatId], // Store as array
      };

      // Use upsert for Sequelize (equivalent to findOneAndUpdate with upsert)
      const [v2rayDB, wasCreated] = await V2ray.upsert({
        ...whereClause,
        ...data,
      } as any);

      return v2rayDB;
    } catch (err) {
      console.log("v2ray update inbound", err);
      return false;
    }
  } catch (error) {
    console.error("Error updating inbound:", error);

    return false;
  }
};

export interface IGetInboundFormDataInput {
  chatId: string;
  value: number;
  expireDays?: number;
  itsTest: boolean;
  isEnable?: "true" | "false";
  port?: string;
}
async function getInboundFormData(
  data: IGetInboundFormDataInput
  // chatId: string,
  // value: number = 1,
  // expireDays = 180,
  // itsTest = true,
  // isEnable: 'true' | 'false' = 'true',
) {
  const {
    chatId,
    value = 1,
    expireDays = 180,
    itsTest = true,
    isEnable = "true",
    port = await generateUniquePort(),
  } = data;

  const futureTimestamp = getExpireDate(itsTest ? 0 : expireDays).getTime();
  // const port = await generateUniquePort();
  const total = (itsTest ? 1 : value) * 1024 * 1024 * 1024;

  const form = new formData();
  form.append("port", port);
  form.append("protocol", "vless");
  form.append("up", "0");
  form.append("down", "0");
  form.append("total", total);
  form.append("expiryTime", futureTimestamp);
  form.append("remark", `💡🇹🇷${value}GB-${port}-${chatId}`);
  form.append("enable", isEnable);
  form.append("listen", "");
  form.append(
    "settings",
    JSON.stringify({
      clients: [
        {
          id: uuidv4(),
          flow: "",
          email: generateRandomString(8),
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable: true,
          tgId: "",
          subId: generateRandomString(16),
          comment: "",
          reset: 0,
        },
      ],
      decryption: "none",
      fallbacks: [],
    })
  );
  form.append(
    "streamSettings",
    JSON.stringify({
      network: "tcp",
      security: "none",
      externalProxy: [],
      tcpSettings: {
        acceptProxyProtocol: false,
        header: {
          type: "none",
        },
      },
      sockopt: {
        acceptProxyProtocol: false,
        tcpFastOpen: true,
        mark: 0,
        tproxy: "off",
        tcpMptcp: true,
        tcpNoDelay: true,
        domainStrategy: "UseIP",
        tcpMaxSeg: 1440,
        dialerProxy: "",
        tcpKeepAliveInterval: 0,
        tcpKeepAliveIdle: 300,
        tcpUserTimeout: 10000,
        tcpcongestion: "bbr",
        V6Only: false,
        tcpWindowClamp: 600,
        interface: "",
      },
    })
  );
  form.append(
    "sniffing",
    JSON.stringify({
      enabled: true,
      destOverride: ["http", "tls", "quic", "fakedns"],
      metadataOnly: false,
      routeOnly: false,
    })
  );
  form.append(
    "allocate",
    JSON.stringify({
      strategy: "always",
      refresh: 5,
      concurrency: 3,
    })
  );

  return form;
}
