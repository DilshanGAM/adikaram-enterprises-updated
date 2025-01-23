export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    //user
    const userHeader = req.headers.get("user");
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
    //get shop name in params
    const shopName = req.nextUrl.searchParams.get("shop") || "";
    if (shopName === "") {
        return NextResponse.json({ message: "Shop name is missing" }, { status: 400 });
    }

    //get shop by id
    const shop = await prisma.shop.findUnique({
        where: {
            name: shopName
        }
    });
    if (!shop) {
        return NextResponse.json({ message: "Shop not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Shop retrieved successfully", shop });
}