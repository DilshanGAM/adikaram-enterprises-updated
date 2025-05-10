import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
	const page = req.nextUrl.searchParams.get("page");
	const limit = req.nextUrl.searchParams.get("limit");
	//get ongoing visits
	const visits = await prisma.visit.findMany({
		orderBy: {
			id: "desc",
		},
		skip: (Number(page) - 1) * Number(limit),
		take: Number(limit),
	});
	const total = await prisma.visit.count();
	const totalPages = Math.ceil(total / Number(limit));
	return NextResponse.json({
		visits,
		pageInfo: {
			page: Number(page),
			limit: Number(limit),
			total: total,
			totalPages: totalPages,
		},
		message: "Visits fetched successfully",
	});
}
