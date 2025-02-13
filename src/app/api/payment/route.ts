export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	//get user
	const user = req.headers.get("user");
	if (!user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const userObj = JSON.parse(user);
	//get body
	try {
		const body = await req.json();
		let visitId = null;
		let driverVisitId = null;
		if (body.visitType == "staff-visit") {
			const visit = await prisma.visit.findFirst({
				where: {
					visited_by: userObj.email,
					status: "started",
				},
			});
			if (!visit) {
				return NextResponse.json(
					{ message: "Visit not found" },
					{ status: 404 }
				);
			}
			visitId = visit.id;
		} else if (body.visitType == "driver-visit") {
			const driverVisit = await prisma.driver_visit.findFirst({
				where: {
					verified_by: userObj.email,
					status: "processing",
				},
			});
			if (!driverVisit) {
				return NextResponse.json(
					{ message: "Visit not found" },
					{ status: 404 }
				);
			}
			driverVisitId = driverVisit.id;
		}
		return await prisma.$transaction(
			async (tx) => {
				const returnBill = await tx.return_bill.findFirst({
					where: {
						id: body.return_bill_id,
					},
				});
				if (!returnBill && body.return_bill_id) {
					throw new Error("Return Bill not found");
				}
				if (returnBill?.status == "covered" && body.return_bill_id) {
					throw new Error("Return Bill already covered");
				}

				//get invoice
				const invoice = await tx.invoice.findFirst({
					where: {
						id: body.invoice_id,
					},
					include: {
						payments: true,
						items: true,
					},
				});
				if (!invoice) {
					throw new Error("Invoice not found");
				}
				if (invoice.status == "paid") {
					throw new Error("Invoice already paid");
				}
				if (body.return_bill_id && returnBill?.shop_name != invoice.shop_name) {
					throw new Error("Return Bill not for this shop");
				}
				//create payment
				const paymentPayload = {
					amount: body.return_bill_id ? returnBill?.value : body.amount,
					shop_name: invoice.shop_name,
					visit_id: visitId,
					notes: body.notes,
					type: body.return_bill_id ? "return" : "cash",
					invoice_id: invoice.id,
					driver_visit_id: driverVisitId,
					return_bill_id: returnBill?.id || null,
				};
				const payment = await tx.payment.create({
					data: paymentPayload,
				});
				//update return bill
				if (returnBill) {
					await tx.return_bill.update({
						where: {
							id: body.return_bill_id,
						},
						data: {
							status: "covered",
						},
					});
				}
				//check all payments for the invoice
				const invoicePayments = await tx.payment.findMany({
					where: {
						invoice_id: invoice.id,
					},
				});
				let totalPaid = 0;
				for (const payment of invoicePayments) {
					totalPaid += payment.amount;
				}

				let invoiceValue = 0;
				for (const item of invoice.items) {
					invoiceValue += item.price * item.quantity;
				}
				//update invoice
				if (totalPaid >= invoiceValue) {
					await tx.invoice.update({
						where: {
							id: invoice.id,
						},
						data: {
							status: "paid",
						},
					});
				} else if (totalPaid > 0) {
					await tx.invoice.update({
						where: {
							id: invoice.id,
						},
						data: {
							status: "partially-paid",
						},
					});
				}
				return NextResponse.json({ message: "Payment successful", payment });
			},
			{
				timeout: 30000,
			}
		);
	} catch (e: any) {
		if (e.message) {
			return NextResponse.json({ message: e.message }, { status: 400 });
		}
		return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
	}
}
