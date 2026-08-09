"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/infrastructure/queue/bullmq.ts
var import_bullmq = require("bullmq");
var import_ioredis = __toESM(require("ioredis"));
var redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null
  // Required by BullMQ
};
var redisConnection = new import_ioredis.default(redisOptions);
var QUEUES = {
  SYNC_ORDER: "SYNC_ORDER",
  SYNC_PRODUCT: "SYNC_PRODUCT",
  SYNC_INVENTORY: "SYNC_INVENTORY",
  PROCESS_WEBHOOK: "PROCESS_WEBHOOK"
};
function createQueue(name) {
  return new import_bullmq.Queue(name, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 6e4
        // 1 minute
      },
      removeOnComplete: true,
      removeOnFail: false
      // Keep in failed queue for DLQ inspection
    }
  });
}
function createWorker(name, processor, concurrency = 1) {
  return new import_bullmq.Worker(name, processor, {
    connection: redisConnection,
    concurrency
  });
}
var orderSyncQueue = createQueue(QUEUES.SYNC_ORDER);
var webhookQueue = createQueue(QUEUES.PROCESS_WEBHOOK);

// src/lib/integrations/erp/sync-service.ts
var import_server_only5 = require("server-only");

// src/lib/infrastructure/database/prisma.ts
var import_client = require("@prisma/client");
var import_adapter_pg = require("@prisma/adapter-pg");
var import_pg = __toESM(require("pg"));
var prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in the environment");
  }
  const pool = new import_pg.default.Pool({ connectionString });
  const adapter = new import_adapter_pg.PrismaPg(pool);
  return new import_client.PrismaClient({ adapter });
};
var _a;
var prisma = (_a = globalThis.prismaGlobal) != null ? _a : prismaClientSingleton();
if (false) globalThis.prismaGlobal = prisma;

// src/lib/integrations/erp/erpnext/client.ts
var import_server_only = require("server-only");

// src/lib/core/config/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  // Node Environment
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  // Application URLs
  NEXT_PUBLIC_APP_URL: import_zod.z.string().url().default("http://localhost:3000"),
  // ERPNext (Frappe Cloud) Configurations
  ERPNEXT_URL: import_zod.z.string().url().optional(),
  ERPNEXT_API_KEY: import_zod.z.string().optional(),
  ERPNEXT_API_SECRET: import_zod.z.string().optional(),
  ERPNEXT_WEBHOOK_SECRET: import_zod.z.string().optional(),
  // Queue & Redis (For future use)
  REDIS_URL: import_zod.z.string().url().optional(),
  // Database
  DATABASE_URL: import_zod.z.string().url().optional(),
  // Security Secrets
  AUTH_SECRET: import_zod.z.string().min(32).optional(),
  // S3 / R2 Storage
  S3_ENDPOINT: import_zod.z.string().url().optional(),
  S3_REGION: import_zod.z.string().optional(),
  S3_BUCKET: import_zod.z.string().optional(),
  S3_ACCESS_KEY_ID: import_zod.z.string().optional(),
  S3_SECRET_ACCESS_KEY: import_zod.z.string().optional(),
  S3_PUBLIC_URL: import_zod.z.string().url().optional()
});
var parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("\u274C Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}
var env = parsedEnv.data;
function getServerEnv() {
  return {
    nodeEnv: env.NODE_ENV,
    erpBaseUrl: env.ERPNEXT_URL,
    erpAuthToken: env.ERPNEXT_API_KEY && env.ERPNEXT_API_SECRET ? `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}` : void 0,
    erpWebhookSecret: env.ERPNEXT_WEBHOOK_SECRET,
    s3: {
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      publicUrl: env.S3_PUBLIC_URL
    }
  };
}

// src/lib/integrations/erp/erpnext/mappers.ts
function resolveErpImageUrl(baseUrl, path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl != null ? baseUrl : ""}${path}`;
}
function mapErpItemToProduct(raw, baseUrl) {
  var _a2, _b, _c, _d, _e, _f, _g;
  const slug = raw.item_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const resolvedImage = resolveErpImageUrl(baseUrl, raw.image);
  const product = {
    id: raw.name,
    name: raw.item_name,
    slug,
    description: ((_a2 = raw.description) == null ? void 0 : _a2.replace(/<[^>]*>/g, "").trim()) || "",
    category_id: raw.item_group || null,
    // Mapped from item_group for ProductService to resolve
    ingredients: null,
    nutritional_info: null,
    shelf_life_days: raw.end_of_life ? Math.max(0, Math.floor((new Date(raw.end_of_life).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 3600 * 24))) : null,
    gstRate: raw.taxes && raw.taxes.length > 0 ? raw.taxes[0].tax_rate : raw.item_tax_template ? 18 : 0,
    // Simplified tax fallback
    isFeatured: false,
    primaryImage: resolvedImage ? {
      id: `erp-img-${raw.name}`,
      url: resolvedImage,
      alt: raw.item_name,
      type: "IMAGE"
    } : null,
    created_at: raw.modified || (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: raw.modified || (/* @__PURE__ */ new Date()).toISOString(),
    variants: []
  };
  const standardVariant = {
    id: raw.name,
    // Usually erp item code
    item_code: raw.name,
    name: "Standard Pack",
    price: (_b = raw.standard_rate) != null ? _b : 0,
    wholesalePrice: (_c = raw.custom_wholesale_rate) != null ? _c : null,
    weightGrams: raw.weight_per_unit ? raw.weight_per_unit * 1e3 : null,
    // Assuming ERP uses KG
    length: (_d = raw.custom_length) != null ? _d : null,
    width: (_e = raw.custom_width) != null ? _e : null,
    height: (_f = raw.custom_height) != null ? _f : null,
    inventoryLevels: [{
      warehouseId: "default",
      available: (_g = raw.actual_qty) != null ? _g : 0,
      reserved: 0,
      committed: 0,
      sold: 0,
      damaged: 0,
      returned: 0
    }],
    images: resolvedImage ? [{
      id: `erp-img-${raw.name}`,
      url: resolvedImage,
      alt: raw.item_name,
      type: "IMAGE"
    }] : []
  };
  product.variants.push(standardVariant);
  if (raw.custom_carton_rate) {
    const cartonVariant = {
      id: `${raw.name}-CARTON`,
      item_code: `${raw.name}-CARTON`,
      name: "Carton Box",
      price: raw.custom_carton_rate,
      wholesalePrice: raw.custom_carton_rate,
      // Carton rate is usually already wholesale
      weightGrams: raw.custom_carton_weight ? raw.custom_carton_weight * 1e3 : null,
      length: raw.custom_length ? raw.custom_length * 2 : null,
      // Rough estimation if not provided
      width: raw.custom_width ? raw.custom_width * 2 : null,
      height: raw.custom_height ? raw.custom_height * 2 : null,
      inventoryLevels: [{
        warehouseId: "default",
        available: raw.actual_qty ? Math.floor(raw.actual_qty / 10) : 0,
        // Assuming 10 packs per carton if not strictly tracked
        reserved: 0,
        committed: 0,
        sold: 0,
        damaged: 0,
        returned: 0
      }],
      images: resolvedImage ? [{
        id: `erp-img-${raw.name}-carton`,
        url: resolvedImage,
        alt: `${raw.item_name} Carton`,
        type: "IMAGE"
      }] : []
    };
    product.variants.push(cartonVariant);
  }
  return product;
}
function mapOrderToErpSalesOrder(order, customerId = "Website Walk-in") {
  return {
    customer: customerId,
    customer_name: order.contact.name,
    contact_email: order.contact.email,
    custom_storefront_order_id: order.id,
    items: order.items.map((item) => ({
      item_code: item.productVariantId,
      qty: item.qty,
      rate: item.rate
    }))
  };
}

// src/lib/infrastructure/logger/index.ts
var import_pino = __toESM(require("pino"));
var isProduction = env.NODE_ENV === "production";
var pinoLogger = (0, import_pino.default)({
  level: isProduction ? "info" : "debug",
  transport: isProduction ? void 0 : {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname"
    }
  }
});
var Logger = class {
  static trace(message, meta) {
    if (meta) pinoLogger.trace(meta, message);
    else pinoLogger.trace(message);
  }
  static debug(message, meta) {
    if (meta) pinoLogger.debug(meta, message);
    else pinoLogger.debug(message);
  }
  static info(message, meta) {
    if (meta) pinoLogger.info(meta, message);
    else pinoLogger.info(message);
  }
  static warn(message, meta) {
    if (meta) pinoLogger.warn(meta, message);
    else pinoLogger.warn(message);
  }
  static error(message, error) {
    if (error) {
      if (error instanceof Error) {
        pinoLogger.error({ err: { message: error.message, stack: error.stack } }, message);
      } else {
        pinoLogger.error(error, message);
      }
    } else {
      pinoLogger.error(message);
    }
  }
};

// src/lib/utils/logger.ts
function write(level, message, context) {
  const entry = __spreadValues({
    level,
    message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }, context ? { context } : {});
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
var logger = {
  info: (message, context) => write("info", message, context),
  warn: (message, context) => write("warn", message, context),
  error: (message, context) => write("error", message, context)
};

// src/lib/utils/retry.ts
async function withRetry(operation, options) {
  let lastError;
  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      logger.warn(`Retry ${attempt}/${options.attempts} failed for ${options.operationName}`, {
        error: err
      });
      if (attempt < options.attempts) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }
  }
  logger.error(`All ${options.attempts} retries failed for ${options.operationName}`, {
    error: lastError
  });
  throw lastError;
}

// src/lib/integrations/erp/erpnext/client.ts
var ERPNextClient = class {
  constructor() {
    this.baseUrl = getServerEnv().erpBaseUrl;
    this.token = getServerEnv().erpAuthToken;
  }
  isConfigured() {
    return Boolean(this.baseUrl && this.token);
  }
  headers() {
    if (!this.token) throw new Error("ERP_AUTH_TOKEN is not configured.");
    return {
      Authorization: this.token,
      "Content-Type": "application/json"
    };
  }
  endpoint(path) {
    if (!this.baseUrl) throw new Error("ERP_BASE_URL is not configured.");
    return `${this.baseUrl}${path}`;
  }
  async fetchVisibleProducts() {
    if (!this.isConfigured()) {
      Logger.warn("ERPNext product fetch skipped because ERP integration is not configured");
      return [];
    }
    const fields = encodeURIComponent(
      JSON.stringify(["name", "item_name", "standard_rate", "image", "description", "item_group", "item_tax_template", "taxes", "weight_per_unit", "custom_length", "custom_width", "custom_height", "end_of_life", "custom_wholesale_rate", "custom_carton_rate", "custom_carton_weight"])
    );
    const filters = encodeURIComponent(JSON.stringify([["show_in_website", "=", 1]]));
    const url = this.endpoint(
      `/api/resource/Item?fields=${fields}&filters=${filters}&limit_page_length=0`
    );
    return withRetry(
      async () => {
        var _a2;
        const res = await fetch(url, {
          headers: this.headers(),
          cache: "no-store"
        });
        if (!res.ok) {
          throw new Error(`ERPNext GET /Item failed: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        return ((_a2 = json.data) != null ? _a2 : []).map((item) => mapErpItemToProduct(item, this.baseUrl));
      },
      { attempts: 3, delayMs: 500, operationName: "erpnext.fetchVisibleProducts" }
    );
  }
  async createSalesOrder(order) {
    if (!this.isConfigured()) throw new Error("ERPNext is not configured.");
    const payload = mapOrderToErpSalesOrder(order);
    return withRetry(
      async () => {
        var _a2, _b;
        const res = await fetch(this.endpoint("/api/resource/Sales Order"), {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`ERPNext POST /Sales Order failed: ${res.status} ${text}`);
        }
        const json = await res.json();
        return { name: (_b = (_a2 = json.data) == null ? void 0 : _a2.name) != null ? _b : "unknown" };
      },
      { attempts: 3, delayMs: 750, operationName: "erpnext.createSalesOrder" }
    );
  }
};
var erpNextClient = new ERPNextClient();

// src/lib/integrations/erp/webhook-mappers.ts
function readString(payload, keys) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
function readNumber(payload, keys, fallback = 0) {
  for (const key of keys) {
    const value = Number(payload[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}
function mapWebhookToProduct(event) {
  const itemName = readString(event.payload, ["item_name", "title", "name"]);
  const itemCode = readString(event.payload, ["item_code", "name"]);
  const imageUrl = readString(event.payload, ["image"]) || null;
  return {
    id: itemCode,
    name: itemName,
    slug: itemName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
    description: readString(event.payload, ["description"]),
    category_id: null,
    ingredients: null,
    nutritional_info: null,
    shelf_life_days: null,
    gstRate: 0,
    isFeatured: false,
    primaryImage: imageUrl ? {
      id: `wh-img-${itemCode}`,
      url: imageUrl,
      alt: itemName,
      type: "IMAGE"
    } : null,
    created_at: event.occurred_at,
    updated_at: event.occurred_at,
    variants: [{
      id: itemCode,
      item_code: itemCode,
      name: "Standard Pack",
      price: readNumber(event.payload, ["standard_rate", "rate", "price"]),
      inventoryLevels: [{
        warehouseId: "default",
        available: readNumber(event.payload, ["actual_qty", "available_qty", "stock_qty"]),
        reserved: 0,
        committed: 0,
        sold: 0,
        damaged: 0,
        returned: 0
      }],
      images: imageUrl ? [{
        id: `wh-img-${itemCode}`,
        url: imageUrl,
        alt: itemName,
        type: "IMAGE"
      }] : []
    }]
  };
}
function mapWebhookToInventory(event) {
  return {
    item_code: readString(event.payload, ["item_code", "name"]),
    warehouseId: readString(event.payload, ["warehouse_id", "warehouse", "warehouseId"]) || "default",
    available_qty: readNumber(event.payload, ["available_qty", "actual_qty", "stock_qty"]),
    reserved_qty: readNumber(event.payload, ["reserved_qty"], 0),
    updated_at: event.occurred_at
  };
}
function mapWebhookToCustomer(event) {
  return {
    id: readString(event.payload, ["customer_id", "name"]) || void 0,
    name: readString(event.payload, ["customer_name", "name"]),
    email: readString(event.payload, ["email", "contact_email"]).toLowerCase(),
    address: readString(event.payload, ["address", "customer_address"]) || void 0,
    updated_at: event.occurred_at
  };
}

// src/lib/repositories/catalog-repository.ts
var import_server_only2 = require("server-only");
async function upsertSyncedProduct(product) {
  try {
    await prisma.$transaction(async (tx) => {
      if (product.category_id) {
        const existingCategory = await tx.category.findUnique({
          where: { id: product.category_id }
        });
        const existingBySlug = !existingCategory ? await tx.category.findFirst({
          where: { slug: product.category_id.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
        }) : null;
        let finalCategoryId = (existingCategory == null ? void 0 : existingCategory.id) || (existingBySlug == null ? void 0 : existingBySlug.id);
        if (!finalCategoryId) {
          const newSlug = product.category_id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const newCategory = await tx.category.create({
            data: {
              name: product.category_id,
              slug: newSlug,
              description: `Auto-created from ERPNext item group: ${product.category_id}`
            }
          });
          finalCategoryId = newCategory.id;
        }
        product.category_id = finalCategoryId;
      }
      const dbProduct = await tx.product.upsert({
        where: { slug: product.slug },
        create: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.category_id,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritional_info,
          shelfLifeDays: product.shelf_life_days,
          gstRate: product.gstRate || 0,
          isFeatured: product.isFeatured || false,
          isDeleted: false
        },
        update: {
          name: product.name,
          description: product.description,
          categoryId: product.category_id,
          ingredients: product.ingredients,
          nutritionalInfo: product.nutritional_info,
          shelfLifeDays: product.shelf_life_days,
          gstRate: product.gstRate,
          isFeatured: product.isFeatured,
          isDeleted: false
        }
      });
      for (const variant of product.variants) {
        await tx.productVariant.upsert({
          where: { itemCode: variant.item_code },
          create: {
            id: variant.id,
            productId: dbProduct.id,
            itemCode: variant.item_code,
            name: variant.name,
            price: variant.price,
            wholesalePrice: variant.wholesalePrice,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            weightGrams: variant.weightGrams,
            isDeleted: false
          },
          update: {
            productId: dbProduct.id,
            name: variant.name,
            price: variant.price,
            wholesalePrice: variant.wholesalePrice,
            length: variant.length,
            width: variant.width,
            height: variant.height,
            weightGrams: variant.weightGrams,
            isDeleted: false
          }
        });
      }
    });
  } catch (error) {
    Logger.error("Failed to upsert product in DB", { slug: product.slug, error });
    throw error;
  }
}
async function removeSyncedProduct(slug) {
  try {
    await prisma.product.update({
      where: { slug },
      data: { isDeleted: true }
    });
  } catch (error) {
    Logger.error("Failed to soft-delete product", { slug, error });
  }
}
async function updateInventorySnapshot(snapshot) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { itemCode: snapshot.item_code }
    });
    if (!variant) return;
    await prisma.inventoryLevel.upsert({
      where: {
        warehouseId_productVariantId: {
          warehouseId: snapshot.warehouseId,
          productVariantId: variant.id
        }
      },
      update: { available: snapshot.available_qty, reserved: snapshot.reserved_qty || 0 },
      create: {
        warehouseId: snapshot.warehouseId,
        productVariantId: variant.id,
        available: snapshot.available_qty,
        reserved: snapshot.reserved_qty || 0
      }
    });
  } catch (error) {
    Logger.error("Failed to update inventory snapshot", { itemCode: snapshot.item_code, error });
  }
}

// src/lib/repositories/customer-repository.ts
var import_server_only3 = require("server-only");
var customers = /* @__PURE__ */ new Map();
async function upsertCustomerProfile(customer) {
  customers.set(customer.email, customer);
}

// src/lib/repositories/order-repository.ts
var import_server_only4 = require("server-only");
var import_client2 = require("@prisma/client");
async function markOrderErpSynced(orderId) {
  await prisma.eRPSync.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId,
      targetSystem: "erpnext",
      status: "SUCCESS"
    }
  });
}
async function markOrderErpFailed(orderId) {
  await prisma.eRPSync.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId,
      targetSystem: "erpnext",
      status: "FAILED"
    }
  });
}

// src/lib/infrastructure/events/EventBus.ts
var import_events = require("events");
var EventBus = class _EventBus {
  constructor() {
    this.emitter = new import_events.EventEmitter();
  }
  static getInstance() {
    if (!_EventBus.instance) {
      _EventBus.instance = new _EventBus();
    }
    return _EventBus.instance;
  }
  subscribe(eventType, handler) {
    this.emitter.on(eventType, async (event) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error handling event ${eventType}:`, err);
      }
    });
  }
  /**
   * Used strictly inside a database transaction to ensure atomicity.
   */
  async publishWithinTransaction(tx, event) {
    await tx.outboxEvent.create({
      data: {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        payload: event.payload,
        published: false
      }
    });
  }
  /**
   * For direct emit in scenarios where outbox might not be needed or handled by the outbox worker.
   */
  async publish(event) {
    await prisma.outboxEvent.create({
      data: {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        eventType: event.eventType,
        payload: event.payload,
        published: false
      }
    });
    this.dispatch(event);
  }
  /**
   * Dispatch the event to in-memory subscribers. Used by OutboxWorker.
   */
  async dispatch(event) {
    this.emitter.emit(event.eventType, event);
  }
};
var eventBus = EventBus.getInstance();

// src/lib/core/domain/events/DomainEvent.ts
var ProductUpdatedEvent = class {
  constructor(slug, product) {
    this.aggregateType = "Product";
    this.eventType = "ProductUpdated";
    this.id = crypto.randomUUID();
    this.aggregateId = slug;
    this.occurredAt = /* @__PURE__ */ new Date();
    this.payload = {
      slug,
      product
    };
  }
};

// src/lib/integrations/erp/sync-service.ts
async function syncOrder(order) {
  const erpOrder = await erpNextClient.createSalesOrder(order);
  await markOrderErpSynced(order.id);
  Logger.info("Storefront order synced to ERPNext", {
    orderId: order.id,
    erpOrderName: erpOrder.name
  });
}
async function handleWebhook(event) {
  Logger.info("ERP webhook processing started", {
    entity: event.entity,
    action: event.action,
    eventId: event.event_id
  });
  if (event.entity === "product") {
    const product = mapWebhookToProduct(event);
    if (event.action === "deleted") {
      await removeSyncedProduct(product.slug);
    } else {
      await upsertSyncedProduct(product);
    }
    const domainEvent = new ProductUpdatedEvent(product.slug, product);
    await eventBus.publish(domainEvent);
    return;
  }
  if (event.entity === "inventory") {
    const inventory = mapWebhookToInventory(event);
    await updateInventorySnapshot(inventory);
    const domainEvent = new ProductUpdatedEvent(inventory.item_code);
    await eventBus.publish(domainEvent);
    return;
  }
  if (event.entity === "customer") {
    await upsertCustomerProfile(mapWebhookToCustomer(event));
    return;
  }
  Logger.info("ERP order webhook acknowledged for reconciliation", {
    eventId: event.event_id,
    action: event.action
  });
}
async function processErpSyncJob(job) {
  const entityId = job.payload.order_id || job.payload.product_id || job.id;
  try {
    if (job.type === "order.created") {
      await syncOrder(job.payload);
    } else {
      await handleWebhook(job.payload);
    }
    await prisma.eRPSync.updateMany({
      where: { entityType: job.type, entityId },
      data: { status: "SUCCESS" }
    });
  } catch (err) {
    if (job.type === "order.created") {
      await markOrderErpFailed(job.payload.id);
    }
    await prisma.eRPSync.updateMany({
      where: { entityType: job.type, entityId },
      data: {
        status: "FAILED",
        lastError: err.message || String(err),
        attempts: job.attempts
      }
    });
    throw err;
  }
}

// worker.ts
Logger.info("Starting Background Workers...");
var erpWorker = createWorker("erp-sync", async (job) => {
  Logger.info(`Processing ERP Sync Job ${job.id}`);
  try {
    await processErpSyncJob({
      id: job.id,
      type: job.data.type,
      payload: job.data.payload,
      attempts: job.attemptsMade,
      queued_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    Logger.info(`Completed ERP Sync Job ${job.id}`);
  } catch (error) {
    Logger.error(`Failed ERP Sync Job ${job.id}`, { error });
    throw error;
  }
});
erpWorker.on("failed", async (job, err) => {
  Logger.error(`Job ${job == null ? void 0 : job.id} failed after ${job == null ? void 0 : job.attemptsMade} attempts`, { error: err.message });
  if (job && job.attemptsMade === job.opts.attempts) {
    const entityId = job.data.payload.order_id || job.data.payload.product_id || job.id;
    try {
      await prisma.eRPSync.updateMany({
        where: { entityId, entityType: job.data.type, status: "PENDING" },
        data: { status: "FAILED" }
      });
      Logger.error(`[DLQ] ERPSync for ${entityId} permanently failed and marked in DB.`);
    } catch (e) {
      Logger.error(`[DLQ] Failed to update ERPSync status for ${entityId}`);
    }
  }
});
process.on("SIGTERM", async () => {
  await erpWorker.close();
  process.exit(0);
});
