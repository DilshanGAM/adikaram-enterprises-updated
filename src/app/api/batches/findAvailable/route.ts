export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	//get query params
	const key = req.nextUrl.searchParams.get("productKey") || "";

	//get user
	const userHeader = req.headers.get("user");
	//admin staff manager
	const user = userHeader ? JSON.parse(userHeader) : null;
	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
	if (
		user.role !== "admin" &&
		user.role !== "manager" &&
		user.role !== "staff"
	) {
		return NextResponse.json(
			{
				message:
					"Unauthorized: Only admin, manager and staff can create accounts",
			},
			{ status: 401 }
		);
	}

	//validate product key
	const product = await prisma.product.findFirst({
		where: {
			key: key,
		},
	});
	if (!product) {
		return NextResponse.json({ message: "Product not found" }, { status: 404 });
	}
	//find batches with remaining> 0
	const batches = await prisma.batch.findMany({
		where: {
			product_key: key,
			remaining: {
				gt: 0,
			},
		},
	});
	return NextResponse.json({ message: "Batches found", batches });
}
