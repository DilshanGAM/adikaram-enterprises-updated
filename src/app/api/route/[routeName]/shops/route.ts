import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * Middleware: Authorize User
 */
async function authorizeUser(req: NextRequest, allowedRoles: string[]) {
  const userHeader = req.headers.get("user");
  if (!userHeader) {
    throw {
      message: "Unauthorized access",
      code: 252901,
      description: "User information is missing in the request headers",
      status: 401,
    };
  }

  const user = JSON.parse(userHeader);
  if (!allowedRoles.includes(user.role)) {
    throw {
      message: "Unauthorized access",
      code: 252902,
      description: "You do not have permission to perform this action",
      status: 403,
    };
  }

  return user;
}

/**
 * GET: Retrieve all shops in a route
 */
export async function GET(req: NextRequest, { params }: { params: { routeName: string } }) {
  try {
    const { routeName } = params;
    const shops = await prisma.shop_route.findMany({
      where: { route_name: routeName },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ message: "Shops retrieved successfully", shops });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Error retrieving shops", code: 252903, description: e.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update the shops in a route
 */
export async function PUT(req: NextRequest, { params }: { params: { routeName: string } }) {
  try {
    await authorizeUser(req, ["admin", "manager"]);

    const { routeName } = params;
    const { shops } = await req.json();

    // Clear existing shops in the route
    await prisma.shop_route.deleteMany({ where: { route_name: routeName } });

    // Add the updated shops
    const updatedShops = shops.map((shop: any) => ({
      route_name: routeName,
      shop_name: shop.shop_name,
      order: shop.order,
    }));

    await prisma.shop_route.createMany({ data: updatedShops });

    return NextResponse.json({ message: "Route updated successfully" });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Error updating route", code: 252904, description: e.message },
      { status: 500 }
    );
  }
}
