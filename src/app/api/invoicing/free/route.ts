export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObj = JSON.parse(user);
    //check if user is manager or admin
    if (userObj.role !== "manager" && userObj.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    //get page number and limitation from the params
    const limit = req.nextUrl.searchParams.get("limit") || 10;
    const page = req.nextUrl.searchParams.get("page") || 1;
    //get starting date from the params
    const startDate = req.nextUrl.searchParams.get("startDate") || "1970-01-01";
    //get ending date from the params
    const endDate = req.nextUrl.searchParams.get("endDate") || "2100-01-01";
    //get total pages
    try{
        const total = await prisma.free_item.count({
            where: {
                invoice: {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            },
        });
        const freeItems = await prisma.free_item.findMany({
            take: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
            include: {
                invoice: true,
            },
            orderBy: {
                invoice: {
                    date: "desc",
                },
            },
            where: {
                invoice: {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            },
        });
        const pageInfo = {
            total: total,
            limit: limit,
            page: page,
        };
        return NextResponse.json({ freeItems, pageInfo, message: "Success" });
    }catch(e:any){
        if (e.message) {
            return NextResponse.json({ message: e.message }, { status: 500 });
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
