export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    //check if user is staff manager or admin
    const userObject = user ? JSON.parse(user) : null;
    if(userObject && userObject.role !== "staff" && userObject.role !== "manager" && userObject.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    //get shop name
    const shopName = req.nextUrl.searchParams.get("shopName") || "not-found";
    if (shopName === "not-found") {
        return NextResponse.json({ message: "Shop name not found" }, { status: 404 });
    }
	try {
		const notCoveredReturnBills = await prisma.return_bill.findMany({
			where: {
				status: "not-covered",  
                shop_name: shopName,
			},
			include: {
				items: true,
			},
		});
        return NextResponse.json({ notCoveredReturnBills , message : "Success" });
	} catch (e:any) {
        if(e.message){
            return NextResponse.json({ message: e.message }, { status: 500 });
        }
		
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
