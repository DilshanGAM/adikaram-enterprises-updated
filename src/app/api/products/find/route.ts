export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    //get query params
    const query = req.nextUrl.searchParams.get("query") || "";

    //get user
    const userHeader = req.headers.get("user");
    //admin staff manager
    const user = userHeader ? JSON.parse(userHeader) : null;
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "admin" && user.role !== "manager" && user.role !== "staff") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin, manager and staff can create accounts" },
            { status: 401 }
        );
    }

    //get matching products by key
    const products = await prisma.product.findMany({
        where: {
            key: {
                contains: query
            }
        }
    });
    return NextResponse.json({ message: "Products found", products });
}


