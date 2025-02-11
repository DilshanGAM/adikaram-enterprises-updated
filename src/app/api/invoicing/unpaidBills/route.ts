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
			userObject.role !== "staff" &&
			userObject.role !== "manager" &&
			userObject.role !== "admin"
		) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		//if it is staff check for visit started
		if (userObject && userObject.role === "staff") {
			const visit = await prisma.visit.findFirst({
				where: {
					visited_by: userObject.email,
					status: "started",
				},
			});
			if (!visit) {
				return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
			}
		}
		const shopName = req.nextUrl.searchParams.get("shopName") || "not-found";
		if (shopName === "not-found") {
			return NextResponse.json(
				{ message: "Shop name not found" },
				{ status: 404 }
			);
		}
		const bills = [];
		const unpaidBills = await prisma.invoice.findMany({
			where: {
				shop_name: shopName,
				status: {
					in: ["not-paid", "partially-paid"],
				},
			},
			include: {
				payments: true,
                items: true,
			},
		});
        for (const bill of unpaidBills) {
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
        return NextResponse.json({ message: "Unpaid bills found", bills });
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
