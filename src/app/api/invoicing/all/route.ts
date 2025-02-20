export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserType } from "@/types/user";

export async function GET(req: NextRequest) {
	try {
		const user = req.headers.get("user");
		if (!user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		//check if user is staff manager or admin
		const userObject: UserType | null = user ? JSON.parse(user) : null;

		if (
			userObject &&
			userObject.role !== "manager" &&
			userObject.role !== "admin"
		) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		
		const limit = req.nextUrl.searchParams.get("limit") || 10;
		const page = req.nextUrl.searchParams.get("page") || 1;
		const total = await prisma.invoice.count();
        const invoices = await prisma.invoice.findMany({
            take: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
            include: {
                payments: true,
                items: true,
            },
            orderBy: {
                date: "desc",
            },
        });
		const bills = [];
		
        for (const bill of invoices) {
            let totalPaid = 0;
            for (const payment of bill.payments) {
                totalPaid += payment.amount;                
            }
            let value = 0;
            for (const item of bill.items) {
                value += item.price * item.quantity;
            }
            value = value - bill.discount + bill.tax;
            bills.push({
                bill,
                totalPaid,
                value,
            });
        }
        return NextResponse.json({ message: "Bills found", bills , pageInfo: { total, limit, page } });
	} catch (err: any) {
		if (err.message) {
			return NextResponse.json({ message: err.message }, { status: 500 });
		}
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
