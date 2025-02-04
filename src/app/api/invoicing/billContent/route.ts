export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest , NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try{const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObject = JSON.parse(user);
    let allowed = false;
    if (userObject.role === "admin" || userObject.role === "manager") {
        allowed = true;
    } else if (userObject.role === "staff") {
        //check for started visit
        const visit = await prisma.visit.findFirst({
            where: {
                visited_by: userObject.id,
                status: "started"
            },
        });
        if (visit) {
            allowed = true;
        }
        
    }
    if (!allowed) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const billId = req.nextUrl.searchParams.get("billId");
    if (!billId) {
        return NextResponse.json({ message: "Bill ID required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
        where: {
            id: parseInt(billId),
        },
        include:{
            items:{
                include:{
                    product:true,
                    batch:true
                }
            },
            free_items:{
                include:{
                    product:true,
                    batch:true
                }
            }
        }
    });
    if (!invoice) {
        return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Bill found", invoice });}catch(e){
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }


}