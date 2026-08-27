import { api } from "@/utils/api";
import { logger } from "@/services/logger.service";
import type { Product, ScaleData, SerialResponse } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Default deduplication interval in milliseconds (2s) */
export const DEDUP_MS = 2000;

// ─── Types ───────────────────────────────────────────────────────────────────

/** Result of processing a raw serial chunk */
export interface ChunkResult {
  messages: ScaleData[];
  remaining: string;
}

/** Backend WeightScale entity shape */
export interface WeightScale {
  id: number;
  name: string;
  /** 1 = active connect, 2 = disconnect, 3 = non active */
  status: "1" | "2" | "3";
  mac_ip: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for creating/updating a WeightScale */
export interface WeightScalePayload {
  name: string;
  status?: "1" | "2" | "3";
  mac_ip?: string;
}

/** Connection state for the serial device */
export interface SerialConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  baudRate: number;
  error: string | null;
}

/** Result of processing a serial read chunk (alias for ChunkResult) */
export interface SerialProcessResult {
  messages: ScaleData[];
  remaining: string;
}

/** Options for connecting to a serial port */
export interface SerialConnectOptions {
  baudRate?: number;
}

// ─── Scale Data Parsing ──────────────────────────────────────────────────────

/**
 * Try to parse a single text line as a ScaleData JSON.
 * Returns ScaleData if valid, null otherwise.
 */
function parseScaleJson(text: string): ScaleData | null {
  const trimmed = text.trim();
  logger.debug("[serial] parseScaleJson input:", JSON.stringify(text));
  logger.debug("[serial] parseScaleJson trimmed:", JSON.stringify(trimmed));

  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    logger.debug("[serial] parseScaleJson SKIP - not wrapped in braces:", JSON.stringify(trimmed));
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if ("itemCode" in parsed && "weight" in parsed && "price" in parsed) {
      logger.debug("[serial] parseScaleJson SUCCESS:", JSON.stringify(parsed));
      return parsed as ScaleData;
    } else {
      logger.debug("[serial] parseScaleJson missing required fields (itemCode, weight, price). Got keys:", Object.keys(parsed));
    }
  } catch (e) {
    logger.warn("[serial] parseScaleJson JSON parse failed:", (e as Error)?.message, "input:", JSON.stringify(trimmed));
  }

  return null;
}

/**
 * Accumulate raw serial data into a buffer and extract complete JSON objects.
 * Handles both:
 *   - Compact one-line JSON objects separated by newlines
 *   - Pretty-printed multi-line JSON (braces/fields on separate lines)
 *   - Partial chunks (data arriving in multiple reads)
 *
 * Uses brace-depth counting to find balanced `{...}` pairs instead of
 * naively splitting by newlines.
 *
 * @param buffer  - previous buffer (from a ref)
 * @param incoming - new data from serial port
 * @returns list of parsed ScaleData messages and the remaining buffer
 */
export function processSerialChunk(
  buffer: string,
  incoming: string,
): ChunkResult {
  const messages: ScaleData[] = [];
  const current = buffer + incoming;
  let remaining = "";

  logger.debug("[serial] processSerialChunk combined:", JSON.stringify(current));

  // Scan for complete JSON objects using brace-depth counting
  let searchStart = 0;

  while (searchStart < current.length) {
    const firstBrace = current.indexOf("{", searchStart);
    if (firstBrace === -1) {
      // No more opening braces — everything from here is buffer
      remaining = current.slice(searchStart);
      break;
    }

    // Walk forward counting braces to find matching closing brace
    let depth = 0;
    let closingIdx = -1;
    for (let i = firstBrace; i < current.length; i++) {
      if (current[i] === "{") depth++;
      else if (current[i] === "}") {
        depth--;
        if (depth === 0) {
          closingIdx = i;
          break;
        }
      }
    }

    if (closingIdx === -1) {
      // No matching closing brace — this JSON is incomplete, keep as buffer
      remaining = current.slice(firstBrace);
      break;
    }

    // Extract complete JSON string and try to parse
    const jsonStr = current.slice(firstBrace, closingIdx + 1);
    logger.debug("[serial] processSerialChunk candidate JSON:", JSON.stringify(jsonStr));
    const msg = parseScaleJson(jsonStr);
    if (msg) messages.push(msg);
    searchStart = closingIdx + 1;
  }

  logger.debug("[serial] processSerialChunk result:", messages.length, "messages, remaining:", JSON.stringify(remaining));
  return { messages, remaining };
}

/**
 * Find a product from a list by barcode, productId, or id.
 */
export function findProductByCode(
  products: Product[],
  code: string,
): Product | undefined {
  const c = String(code);
  return (
    products.find((p) => String(p.barcode) === c) ||
    products.find((p) => String(p.productId) === c) ||
    products.find((p) => String(p.id) === c)
  );
}

/**
 * Build a JSON response to send back to the serial device.
 */
export function buildSerialResponse(
  product: Product,
  weight: number,
): SerialResponse {
  const roundedWeight = Math.round(weight * 100) / 100;
  return {
    name: product.name,
    code: product.barcode,
    base_price: product.basePrice,
    total_price: Math.round(product.basePrice * roundedWeight),
    weight: roundedWeight,
    type: product.unit === "2" || product.unit === "PCS" ? "ekor" : "kg",
  };
}

/**
 * Check if scale data is valid and active (status === true).
 */
export function isScaleDataActive(
  data: ScaleData | null,
): data is ScaleData {
  return data !== null && data.status === true;
}

/**
 * Check if weight is near zero (reset signal from scale).
 */
export function isWeightResetSignal(data: ScaleData): boolean {
  return data.weight < 0.01;
}

/**
 * Generate a deduplication key based on itemCode + weight.
 */
export function makeDataKey(data: ScaleData): string {
  return `${data.itemCode}-${data.weight}`;
}

// ─── Serial API (backend CRUD + higher-level helpers) ────────────────────────

export const SerialAPI = {
  /** Fetch all registered weight scales */
  list: async (): Promise<WeightScale[]> => {
    const res = await api.get<WeightScale[]>("/weight-scale-list");
    return res;
  },

  /** Register a new weight scale */
  create: async (payload: WeightScalePayload): Promise<WeightScale> => {
    const res = await api.post<WeightScale>("/weight-scale-create", payload);
    return res;
  },

  /** Update an existing weight scale */
  update: async (id: number, payload: Partial<WeightScalePayload>): Promise<WeightScale> => {
    const res = await api.patch<WeightScale>(`/weight-scale-update/${id}`, payload);
    return res;
  },

  /** Delete a weight scale */
  delete: async (id: number): Promise<void> => {
    await api.get(`/weight-scale-delete/${id}`);
  },

  /** Process incoming raw serial string and extract scale messages */
  processChunk: (buffer: string, incoming: string): ChunkResult => {
    return processSerialChunk(buffer, incoming);
  },

  /** Find a product by barcode, productId, or id */
  findProduct: (products: Product[], code: string): Product | undefined => {
    return findProductByCode(products, code);
  },

  /** Build a SerialResponse from a matched product and weight */
  buildResponse: (product: Product, weight: number): SerialResponse => {
    return buildSerialResponse(product, weight);
  },

  /** Check if scale data is valid and active */
  isActive: (data: ScaleData | null): data is ScaleData => {
    return isScaleDataActive(data);
  },

  /** Check if weight is near zero (reset signal) */
  isResetSignal: (data: ScaleData): boolean => {
    return isWeightResetSignal(data);
  },

  /** Generate a deduplication key for a scale data point */
  dedupKey: (data: ScaleData): string => {
    return makeDataKey(data);
  },

  /** Deduplication interval in ms */
  DEDUP_MS,

  /** Get stored serial connection preferences from localStorage */
  getStoredConnectionState: (): { baudRate: number } => {
    const stored = localStorage.getItem("serial_config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { baudRate: parsed.baudRate || 115200 };
      } catch {
        // ignore parse error
      }
    }
    return { baudRate: 115200 };
  },

  /** Persist serial connection preferences to localStorage */
  saveConnectionState: (state: { baudRate: number }): void => {
    localStorage.setItem("serial_config", JSON.stringify(state));
  },

  /** Check if the Web Serial API is available in the current browser */
  isSupported: (): boolean => {
    return "serial" in navigator;
  },
};

