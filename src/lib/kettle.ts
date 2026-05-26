import { AppError } from "@/lib/errors";

const SKU = "H717A";
const DEVICE = process.env.DEVICE;
const GOVEE_API_URL =
  "https://openapi.api.govee.com/router/api/v1/device/control";
const API_KEY = process.env.GOVEE_API_KEY;

type GoveeCapability =
  | {
      type: "devices.capabilities.on_off";
      instance: "powerSwitch";
      value: 0 | 1;
    }
  | {
      type: "devices.capabilities.temperature_setting";
      instance: "sliderTemperature";
      value: { temperature: number; unit: "Celsius" | "Fahrenheit" };
    }
  | {
      type: "devices.capabilities.work_mode";
      instance: "workMode";
      value: { workMode: number; modeValue: number };
    };

type KettleMode = "M1" | "M2" | "M3" | "M4";

const MODES: Record<
  KettleMode,
  { value: number; label: string; tempCelsius: number; tempFahrenheit: number }
> = {
  M1: { value: 2, label: "Black Tea", tempCelsius: 100, tempFahrenheit: 212 },
  M2: { value: 3, label: "Green Tea", tempCelsius: 82, tempFahrenheit: 180 },
  M3: { value: 4, label: "Oolong Tea", tempCelsius: 91, tempFahrenheit: 195 },
  M4: { value: 5, label: "Coffee", tempCelsius: 96, tempFahrenheit: 205 },
};

const sendCommand = async (capability: GoveeCapability) => {
  if (!API_KEY) {
    throw new AppError({
      code: "MISCONFIGURATION",
      message: "GOVEE_API_KEY environment variable is not set",
      status: 500,
    });
  }

  let response: Response;

  try {
    response = await fetch(GOVEE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Govee-API-Key": API_KEY,
      } as HeadersInit,
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        payload: {
          sku: SKU,
          device: DEVICE,
          capability,
        },
      }),
    });
  } catch (cause) {
    throw new AppError({
      code: "INTERNAL",
      message: "Failed to reach Govee API",
      status: 503,
      cause,
    });
  }

  if (!response.ok) {
    throw new AppError({
      code: "INTERNAL",
      message: `Govee API returned HTTP ${response.status}`,
      status: response.status,
    });
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new AppError({
      code: "INTERNAL",
      message: `Govee API error: ${data.message}`,
      status: 502,
      meta: { goveeCode: data.code },
    });
  }
};

const turnOn = () => {
  return sendCommand({
    type: "devices.capabilities.on_off",
    instance: "powerSwitch",
    value: 1,
  });
};

const turnOff = () => {
  return sendCommand({
    type: "devices.capabilities.on_off",
    instance: "powerSwitch",
    value: 0,
  });
};

const setTemperature = (
  temperature: number,
  unit: "Celsius" | "Fahrenheit" = "Fahrenheit",
) => {
  if (unit === "Celsius" && (temperature < 40 || temperature > 100)) {
    throw new AppError({
      code: "VALIDATION",
      message: "Temperature must be between 40-100 when unit is Celsius",
      status: 400,
      meta: { temperature, unit },
    });
  }

  if (unit === "Fahrenheit" && (temperature < 100 || temperature > 212)) {
    throw new AppError({
      code: "VALIDATION",
      message: "Temperature must be between 104-212 when unit is Fahrenheit",
      status: 400,
      meta: { temperature, unit },
    });
  }

  return sendCommand({
    type: "devices.capabilities.temperature_setting",
    instance: "sliderTemperature",
    value: { temperature, unit },
  });
};

const setMode = (mode: KettleMode) => {
  return sendCommand({
    type: "devices.capabilities.work_mode",
    instance: "workMode",
    value: { workMode: MODES[mode].value, modeValue: 0 },
  });
};

export const kettle = {
  on: turnOn,
  off: turnOff,
  setTemperature,
  setMode,
  modes: MODES,
};
