import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	const userHeader = req.headers.get("user");
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
	try {
		const startedVisit = await prisma.visit.findFirst({
			where: {
				visited_by: user.email,
				status: "started",
			},
		});

		if (startedVisit) {
			return NextResponse.json(
				{ message: "Visit already started", visit: startedVisit },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "No visit started" },
				{ status: 200 }
			);
		}
	} catch (e:any) {
		return NextResponse.json({ message: e.message }, { status: 500 });
	}
}
