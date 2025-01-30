import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req:NextRequest){
    const userHeader = req.headers.get("user");
    const user = userHeader ? JSON.parse(userHeader) : null;
    //check if user is admin, manager
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "admin" && user.role !== "manager") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin and manager can view visits" },
            { status: 401 }
        );
    }
    //get ongoing visits
    const visits = await prisma.visit.findMany({
        where: {
            status: "started"
        }
    });
    return NextResponse.json({
        visits,
        message : "Ongoing visits found"
    });
}