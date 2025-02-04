export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserType } from "@/types/user";

export async function GET(req: NextRequest) {
	const id = req.nextUrl.searchParams.get("id") || -99;
	if (id == -99) {
		return NextResponse.json({ error: "id not found" }, { status: 400 });
	}
	try {
		const billId = Number(id);
		const invoice = await prisma.invoice.findUnique({
            where: { id: billId },
            include: {
              shop: true, // Fetch related shop details
              visit: true, // Fetch visit details
              items: {
                include: {
                  product: true, // Fetch product details
                  batch: true, // Fetch batch details
                },
              },
              free_items: {
                include: {
                  product: true, // Fetch product details
                  batch: true, // Fetch batch details
                },
              },
              returns: {
                include: {
                  product: true, // Fetch returned product details
                  batch: true, // Fetch batch details
                },
              },
              payments: true, // Fetch related payments
            },
          });
		if (!invoice) {
			return NextResponse.json({ message: "bill not found" }, { status: 404 });
		}
		const visit = invoice.visit;
		if (!visit) {
			return NextResponse.json({ message: "visit not found" }, { status: 404 });
		}
		let userHeader = req.headers.get("user");
		let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
        let allowed = false;
        if (user.role === "admin" || user.role === "manager") {
            allowed = true;
        }else if(user.role === "staff" && visit.visited_by === user.email){
            allowed = true;
        }
        if(!allowed){
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }else{
            return NextResponse.json({ message: "bill found", invoice });
        }

	} catch (e) {
		return NextResponse.json({ error: "bill not found" }, { status: 404 });
	}
}
