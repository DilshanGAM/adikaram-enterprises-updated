export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const totalInvoices = await prisma.invoice.count();
		const totalPayments = await prisma.payment.aggregate({
			_sum: { amount: true },
		});
		const pendingInvoices = await prisma.invoice.count({
			where: { status: "not-paid" },
		});
		const returnBills = await prisma.return_bill.count();
		const totalSales = await prisma.invoice.aggregate({ _sum: { tax: true } });

		const topProducts = await prisma.invoice_item.groupBy({
			by: ["product_key"],
			_sum: { quantity: true },
			orderBy: { _sum: { quantity: "desc" } },
			take: 5, // Top 5 selling products
		});

		const monthlySales = await prisma.invoice.groupBy({
			by: ["date"],
			_sum: { tax: true },
			orderBy: { date: "asc" },
		});

		return NextResponse.json({
			totalInvoices,
			totalPayments: totalPayments._sum.amount || 0,
			pendingInvoices,
			returnBills,
			totalSales: totalSales._sum.tax || 0,
			topProducts,
			monthlySales,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch summary" },
			{ status: 500 }
		);
	}
}
