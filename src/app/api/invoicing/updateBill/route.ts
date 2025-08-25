export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import {
  FreeItemType,
  InvoiceItemType,
  UserType,
} from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SENTINEL = -99;

// --- Helpers ---------------------------------------------------------------

function safeParseUser(header: string | null): UserType | null {
  if (!header) return null;
  try { return JSON.parse(header) as UserType; } catch { return null; }
}

function qtyFromLine(item: { quantity?: number; uom?: number; packs?: number; loose?: number }): number {
  // Prefer explicit quantity; otherwise derive from uom/packs/loose
  if (typeof item.quantity === "number" && Number.isFinite(item.quantity)) return item.quantity;
  const u = Number(item.uom ?? 0);
  const p = Number(item.packs ?? 0);
  const l = Number(item.loose ?? 0);
  return p * u + l;
}

type ProductTotals = Map<string, number>;
type BatchTotals = Map<number, { product_key: string; qty: number }>;

function upsertProductTotal(map: ProductTotals, key: string, delta: number) {
  map.set(key, (map.get(key) ?? 0) + delta);
}

function upsertBatchTotal(map: BatchTotals, batchId: number, product_key: string, delta: number) {
  const cur = map.get(batchId);
  if (!cur) map.set(batchId, { product_key, qty: delta });
  else map.set(batchId, { product_key, qty: cur.qty + delta });
}

/**
 * Aggregate totals to REVERT from an existing invoice record (DB shapes).
 */
function aggregateRevertTotals(existing: {
  items: Array<{ product_key: string; batch_id: number | null; quantity: number; uom: number; packs: number; loose: number; }>;
  free_items: Array<{ product_key: string; batch_id: number | null; uom: number; packs: number; loose: number; }>;
}) {
  const productTotals: ProductTotals = new Map();
  const batchTotals: BatchTotals = new Map();

  // Invoice items: quantity is persisted in DB
  for (const it of existing.items) {
    const qty = typeof it.quantity === "number" ? it.quantity : (it.packs * it.uom + it.loose);
    upsertProductTotal(productTotals, it.product_key, qty);
    if (it.batch_id != null) upsertBatchTotal(batchTotals, it.batch_id, it.product_key, qty);
  }

  // Free items: derive qty from uom/packs/loose
  for (const fi of existing.free_items) {
    const qty = fi.packs * fi.uom + fi.loose;
    upsertProductTotal(productTotals, fi.product_key, qty);
    if (fi.batch_id != null) upsertBatchTotal(batchTotals, fi.batch_id, fi.product_key, qty);
  }

  return { productTotals, batchTotals };
}

/**
 * Aggregate totals to APPLY from incoming payload (request shapes).
 */
function aggregateApplyTotals(payload: { items?: InvoiceItemType[]; freeItems?: FreeItemType[]; }) {
  const rawItems: InvoiceItemType[] = payload.items ?? [];
  const rawFree: FreeItemType[] = payload.freeItems ?? [];

  const productTotals: ProductTotals = new Map();
  const batchTotals: BatchTotals = new Map();

  for (const it of rawItems) {
    const qty = qtyFromLine(it as any);
    upsertProductTotal(productTotals, it.product_key, qty);
    if (it.batch_id !== undefined && it.batch_id !== null && it.batch_id !== BATCH_SENTINEL) {
      upsertBatchTotal(batchTotals, it.batch_id as number, it.product_key, qty);
    }
  }

  for (const fi of rawFree) {
    const qty = qtyFromLine(fi as any); // support optional .quantity if caller sends it
    upsertProductTotal(productTotals, fi.product_key, qty);
    if (fi.batch_id !== undefined && fi.batch_id !== null && fi.batch_id !== BATCH_SENTINEL) {
      upsertBatchTotal(batchTotals, fi.batch_id as number, fi.product_key, qty);
    }
  }

  return { productTotals, batchTotals };
}

/**
 * Normalize items/freeItems for insertion (omit batch_id when sentinel).
 */
function normalizeItemsForInsert(billId: number, items: InvoiceItemType[]) {
  return items.map((it) => {
    const base = {
      invoice_id: billId,
      product_key: it.product_key,
      uom: it.uom,
      packs: it.packs,
      loose: it.loose,
      quantity: qtyFromLine(it as any),
      price: it.price,
    };
    if (it.batch_id === BATCH_SENTINEL || it.batch_id == null) {
      // omit batch_id
      return base as any;
    }
    return { ...base, batch_id: it.batch_id };
  });
}

function normalizeFreeForInsert(billId: number, freeItems: FreeItemType[]) {
  return freeItems.map((fi) => {
    const base = {
      invoice_id: billId,
      product_key: fi.product_key,
      uom: fi.uom,
      packs: fi.packs,
      loose: fi.loose,
    };
    if (fi.batch_id === BATCH_SENTINEL || fi.batch_id == null) {
      // omit batch_id
      return base as any;
    }
    return { ...base, batch_id: fi.batch_id };
  });
}

// --- Handler ---------------------------------------------------------------

export async function PUT(req: NextRequest) {
  // 1) AuthN/AuthZ
  const user = safeParseUser(req.headers.get("user"));
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  if (!(user.role === "admin" || user.role === "manager")) {
    return NextResponse.json({ message: "Unauthorized: Only admin and manager can edit bills" }, { status: 401 });
  }

  try {
    // 2) Inputs
    const body = await req.json();
    const billIdStr = req.nextUrl.searchParams.get("id");
    if (!billIdStr) {
      return NextResponse.json({ message: "Bill ID is required" }, { status: 400 });
    }
    const billId = Number.parseInt(billIdStr, 10);
    if (!Number.isFinite(billId)) {
      return NextResponse.json({ message: "Invalid Bill ID" }, { status: 400 });
    }

    // Fetch existing invoice + lines
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: billId },
      include: { items: true, free_items: true, returns: true, payments: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }
    if (existingInvoice.returns.length > 0 || existingInvoice.payments.length > 0) {
      return NextResponse.json(
        { message: "Invoice cannot be edited after it has been paid or returned" },
        { status: 400 }
      );
    }

    // Totals to revert (from DB) and apply (from payload)
    const { productTotals: revertProd, batchTotals: revertBatch } = aggregateRevertTotals(existingInvoice);
    const { productTotals: applyProd, batchTotals: applyBatch } = aggregateApplyTotals(body);

    // 3) Transaction: revert -> validate -> apply -> rewrite lines
    return await prisma.$transaction(async (tx) => {
      // 3a) Revert stock back from existing items/free_items
      // Products: increment back
      for (const [key, qty] of revertProd.entries()) {
        await tx.product.update({
          where: { key },
          data: { stock: { increment: qty } },
        });
      }
      // Batches: increment remaining
      for (const [batchId, rec] of revertBatch.entries()) {
        await tx.batch.update({
          where: { batch_id: batchId },
          data: { remaining: { increment: rec.qty } },
        });
      }

      // 3b) Hard delete old lines (safe now that revert is done)
      await tx.invoice_item.deleteMany({ where: { invoice_id: existingInvoice.id } });
      await tx.free_item.deleteMany({ where: { invoice_id: existingInvoice.id } });

      // 3c) Validate new requested quantities against current stock/batches
      const productKeys = Array.from(applyProd.keys());
      const batchIds = Array.from(applyBatch.keys());

      if (productKeys.length > 0) {
        const products = await tx.product.findMany({
          where: { key: { in: productKeys } },
          select: { key: true, stock: true },
        });
        const byKey = new Map(products.map(p => [p.key, p.stock]));
        for (const [key, need] of applyProd.entries()) {
          const stock = byKey.get(key);
          if (stock == null) {
            throw new Error(`Product with key ${key} not found`);
          }
          if (stock < need) {
            throw new Error(`${key} quantity not available in stock`);
          }
        }
      }

      if (batchIds.length > 0) {
        const batches = await tx.batch.findMany({
          where: { batch_id: { in: batchIds } },
          select: { batch_id: true, remaining: true },
        });
        const byId = new Map(batches.map(b => [b.batch_id, b.remaining]));
        for (const [batchId, rec] of applyBatch.entries()) {
          const remaining = byId.get(batchId);
          if (remaining == null) {
            throw new Error(`Batch with id ${batchId} not found`);
          }
          if (remaining < rec.qty) {
            throw new Error(`${rec.product_key} quantity not available in stock`);
          }
        }
      }

      // 3d) Apply decrements for new lines
      for (const [key, qty] of applyProd.entries()) {
        await tx.product.update({
          where: { key },
          data: { stock: { decrement: qty } },
        });
      }
      for (const [batchId, rec] of applyBatch.entries()) {
        await tx.batch.update({
          where: { batch_id: batchId },
          data: { remaining: { decrement: rec.qty } },
        });
      }

      // 3e) Update invoice header & re-insert items
      await tx.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          shop_name: body.shop_name ?? existingInvoice.shop_name,
          visit_id: existingInvoice.visit_id,
          type: body.type ?? existingInvoice.type,
          status: body.status ?? existingInvoice.status,
          tax: typeof body.tax === "number" ? body.tax : existingInvoice.tax,
          discount: typeof body.discount === "number" ? body.discount : existingInvoice.discount,
          edited: true,
        },
      });

      // Insert new lines using createMany for performance
      const itemsForInsert = normalizeItemsForInsert(existingInvoice.id, body.items ?? []);
      const freeForInsert = normalizeFreeForInsert(existingInvoice.id, body.freeItems ?? []);

      if (itemsForInsert.length > 0) {
        await tx.invoice_item.createMany({ data: itemsForInsert });
      }
      if (freeForInsert.length > 0) {
        await tx.free_item.createMany({ data: freeForInsert });
      }

      // Return fresh invoice snapshot (optional: include lines)
      const invoice = await tx.invoice.findUnique({
        where: { id: existingInvoice.id },
        include: { items: true, free_items: true },
      });

      return NextResponse.json({ invoice, message: "Invoice updated successfully" });
    }, { timeout: 30000 });

  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
