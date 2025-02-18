export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
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
		//get total pages
		const total = await prisma.driver_visit.count();
		const driverVisits = await prisma.driver_visit.findMany({
			take: Number(limit),
			skip: (Number(page) - 1) * Number(limit),
			include: {
				payments: true,
			},
			orderBy: {
				date: "desc",
			},
		});
		const pageInfo = {
			total: total,
			limit: limit,
			page: page,
		};

		return NextResponse.json({ driverVisits, pageInfo, message: "Success" });
	} catch (e: any) {
		if (e.message) {
			return NextResponse.json({ message: e.message }, { status: 500 });
		}
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
