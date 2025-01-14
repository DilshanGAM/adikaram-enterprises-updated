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

/**
 * Middleware: Authorize User
 */
async function authorizeUser(req: NextRequest, allowedRoles: string[]) {
  const userHeader = req.headers.get("user");
  if (!userHeader) {
    throw {
      message: "Unauthorized access",
      code: 252801,
      description: "User information is missing in the request headers",
      status: 401,
    };
  }

  const user = JSON.parse(userHeader);
  if (!allowedRoles.includes(user.role)) {
    throw {
      message: "Unauthorized access",
      code: 252802,
      description: "You do not have permission to perform this action",
      status: 403,
    };
  }

  return user;
}

/**
 * GET: Retrieve all shops
 */
export async function GET(req: NextRequest) {
  try {
    const shops = await prisma.shop.findMany();
    return NextResponse.json({ message: "Shops retrieved successfully", shops });
  } catch (e: any) {
    return createErrorResponse(
      "Error retrieving shops",
      252803,
      e.message || "An unexpected error occurred while fetching shops",
      500
    );
  }
}

/**
 * POST: Create a new shop
 */
export async function POST(req: NextRequest) {
  try {
    await authorizeUser(req, ["admin", "manager", "staff"]);

    const body = await req.json();
    let { name, address, phone, whatsapp, status, owner, max_credit, longitude, latitude } = body;

    if (!name || !address || !phone || !owner || max_credit === undefined) {
      return createErrorResponse(
        "Missing required fields",
        252804,
        "Required fields: name, address, phone, owner, and max_credit",
        400
      );
    }
    //convert max_credit, logitude and latitude to float
    max_credit = parseFloat(max_credit);
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);

    const shop = await prisma.shop.create({
      data: {
        name,
        address,
        phone,
        whatsapp,
        status: status || "active",
        owner,
        max_credit,
        longitude: longitude || null,
        latitude: latitude || null,
      },
    });

    return NextResponse.json({ message: "Shop created successfully", shop });
  } catch (e: any) {
    return createErrorResponse(
      "Error creating shop",
      252805,
      e.message || "An unexpected error occurred while creating the shop",
      500
    );
  }
}

/**
 * PUT: Update an existing shop
 */
export async function PUT(req: NextRequest) {
  try {
    await authorizeUser(req, ["admin"]);

    const shopName = req.nextUrl.searchParams.get("name");
    if (!shopName) {
      return createErrorResponse(
        "Shop name is required",
        252806,
        "Please provide a shop name as a query parameter",
        400
      );
    }

    const body = await req.json();
    let { address, phone, whatsapp, status, owner, max_credit, longitude, latitude } = body;

    //convert max_credit, logitude and latitude to float

    max_credit = parseFloat(max_credit);
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
    const shop = await prisma.shop.update({
      where: { name: shopName },
      data: {
        address,
        phone,
        whatsapp,
        status,
        owner,
        max_credit,
        longitude,
        latitude,
      },
    });

    return NextResponse.json({ message: "Shop updated successfully", shop });
  } catch (e: any) {
    if (e.code === "P2025") {
      return createErrorResponse(
        "Shop not found",
        252807,
        "The shop you are trying to update does not exist",
        404
      );
    }
    return createErrorResponse(
      "Error updating shop",
      252808,
      e.message || "An unexpected error occurred while updating the shop",
      500
    );
  }
}

/**
 * DELETE: Delete a shop
 */
export async function DELETE(req: NextRequest) {
  try {
    await authorizeUser(req, ["admin"]);

    let shopName = req.nextUrl.searchParams.get("name");
    if (!shopName) {
      return createErrorResponse(
        "Shop name is required",
        252809,
        "Please provide a shop name as a query parameter",
        400
      );
    }


    await prisma.shop.delete({
      where: { name: shopName },
    });

    return NextResponse.json({ message: "Shop deleted successfully" });
  } catch (e: any) {
    console.log(e);
    if (e.code === "P2025") {
      return createErrorResponse(
        "Shop not found",
        252810,
        "The shop you are trying to delete does not exist",
        404
      );
    }
    if (e.code === "P2003") {
      return createErrorResponse(
        "Deletion failed due to constraint",
        252811,
        "The shop cannot be deleted because it is referenced in other records",
        400
      );
    }
    return createErrorResponse(
      "Error deleting shop",
      252812,
      e.message || "An unexpected error occurred while deleting the shop",
      500
    );
  }
}
