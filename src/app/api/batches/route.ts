import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

/**
 * Utility function for error responses
 */
function createErrorResponse(message: string, code: number, description: string, status: number) {
    return NextResponse.json({ message, code, description }, { status });
}


async function authorizeUser(req: NextRequest, allowedRoles: string[]) {
    const userHeader = req.headers.get("user");
    if (!userHeader) {
        throw {
            message: "Unauthorized access",
            code: 252711,
            description: "User information is missing in the request headers",
            status: 401,
        };
    }

    const user = JSON.parse(userHeader);
    if (!allowedRoles.includes(user.role)) {
        throw {
            message: "Unauthorized access",
            code: 252712,
            description: "You do not have permission to perform this action",
            status: 403,
        };
    }

    return user;
}

/**
 * GET: Retrieve all batches or a specific batch by ID
 */
export async function GET(req: NextRequest) {
    try {
        await authorizeUser(req, ["admin", "manager", "staff"]);

        const batchId = req.nextUrl.searchParams.get("batch_id");

        if (batchId) {
            const batch = await prisma.batch.findUnique({
                where: { batch_id: parseInt(batchId) },
            });

            if (!batch) {
                return createErrorResponse(
                    "Batch not found",
                    252701,
                    `No batch found with ID: ${batchId}`,
                    404
                );
            }

            return NextResponse.json({ message: "Batch found", batch });
        }

        const batches = await prisma.batch.findMany();
        return NextResponse.json({ message: "Batches retrieved", batches });
    } catch (e: any) {
        return createErrorResponse(e.message, e.code || 252702, e.description || "Error retrieving batches", e.status || 500);
    }
}

/**
 * POST: Create a new batch
 */
export async function POST(req: NextRequest) {
    try {
        const user = await authorizeUser(req, ["admin", "manager"]);

        const body = await req.json();

        const {
            product_key,
            uom,
            packs,
            loose,
            mfd,
            exp,
            cost,
            labeled_price,
            purchase_invoice_id,
        } = body;

        if (!product_key || !uom || !packs || !mfd || !exp || !cost || !labeled_price) {
            return createErrorResponse(
                "Missing required fields",
                252703,
                "Required fields: product_key, uom, packs, mfd, exp, cost, labeled_price",
                400
            );
        }

        const batch = await prisma.batch.create({
            data: {
                product_key,
                uom,
                packs,
                loose: loose || 0,
                mfd: new Date(mfd),
                exp: new Date(exp),
                cost,
                labeled_price,
                purchase_invoice_id,
                added_by: user.email,
            },
        });
        //update product qty
        const product = await prisma.product.findUnique({
            where: { key:product_key },
        });
        if (product) {
            await prisma.product.update({
                where: { key: product_key },
                data: {
                    stock: product.stock + (packs * uom + loose),
                },
            });
        }

        return NextResponse.json({ message: "Batch created successfully", batch });
    } catch (e: any) {
        return createErrorResponse(e.message, e.code || 252704, e.description || "Error creating batch", e.status || 500);
    }
}

/**
 * PUT: Update an existing batch
 */
export async function PUT(req: NextRequest) {
    try {
        const user = await authorizeUser(req, ["admin"]);

        const batchId = req.nextUrl.searchParams.get("batch_id");

        if (!batchId) {
            return createErrorResponse(
                "Batch ID is required",
                252705,
                "Please provide a batch_id as a query parameter",
                400
            );
        }

        const body = await req.json();

        const {
            product_key,
            uom,
            packs,
            loose,
            mfd,
            exp,
            cost,
            labeled_price,
            purchase_invoice_id,
        } = body;

        const previousBatch = await prisma.batch.findUnique({
            where: { batch_id: parseInt(batchId) },
        });
        if (!previousBatch) {
            return createErrorResponse(
                "Batch not found",
                252706,
                `No batch found with ID: ${batchId}`,
                404
            );
        }
        const batch = await prisma.batch.update({
            where: { batch_id: parseInt(batchId) },
            data: {
                product_key,
                uom,
                packs,
                loose,
                mfd: mfd ? new Date(mfd) : undefined,
                exp: exp ? new Date(exp) : undefined,
                cost,
                labeled_price,
                purchase_invoice_id,
                added_by: user.email,
            },
        });

        //update product stock
        const product = await prisma.product.findUnique({
            where: { key:product_key },
        });
        if (product) {
            await prisma.product.update({
                where: { key: product_key },
                data: {
                    stock: product.stock - (previousBatch.packs * previousBatch.uom + previousBatch.loose) + (packs * uom + loose),
                },
            });
        }

        return NextResponse.json({ message: "Batch updated successfully", batch });
    } catch (e: any) {
        if (e.code === "P2025") {
            return createErrorResponse(
                "Batch not found",
                252706,
                "The batch you are trying to update does not exist",
                404
            );
        }
        return createErrorResponse(e.message, e.code || 252707, e.description || "Error updating batch", e.status || 500);
    }
}

/**
 * DELETE: Delete a batch
 */
export async function DELETE(req: NextRequest) {
    try {
        await authorizeUser(req, ["admin"]);

        const batchId = req.nextUrl.searchParams.get("batch_id");

        if (!batchId) {
            return createErrorResponse(
                "Batch ID is required",
                252708,
                "Please provide a batch_id as a query parameter",
                400
            );
        }

        const batch = await prisma.batch.delete({
            where: { batch_id: parseInt(batchId) },
        });

        return NextResponse.json({ message: "Batch deleted successfully", batch });
    } catch (e: any) {
        if (e.code === "P2025") {
            return createErrorResponse(
                "Batch not found",
                252709,
                "The batch you are trying to delete does not exist",
                404
            );
        }
        return createErrorResponse(e.message, e.code || 252710, e.description || "Error deleting batch", e.status || 500);
    }
}