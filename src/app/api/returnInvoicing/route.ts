export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReturnBillItemType, ReturnBillType, UserType } from "@/types/user";
import { create } from "domain";

export async function POST(req: NextRequest) {
	let userHeader = req.headers.get("user");
	let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
	if (
		user.role !== "admin" &&
		user.role !== "manager" &&
		user.role !== "staff"
	) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const visit = await prisma.visit.findFirst({
		where: {
			visited_by: user.email,
			status: "started",
		},
	});
	if (!visit) {
		return NextResponse.json({ message: "Visit not found" }, { status: 404 });
	}
	try {
		const returnBill: ReturnBillType = await req.json();
		console.log(returnBill);
		if (!returnBill) {
			return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
		}

		const savingReturnBill: {
			shop_name: string;
			date: Date;
			visit_id: number;
			deductions: number;
			items: any[];
            items_cost: number;
            value : number;
		} = {
			shop_name: returnBill.shop_name,
			date: new Date(),
			visit_id: visit.id,
			deductions: returnBill.deductions,
			items: [],
            items_cost: 0,
            value: 0
		};
		let itemCost = 0;
		for (let i = 0; i < returnBill.items.length; i++) {
			const item = returnBill.items[i];
	
			if (item.invoice_item_id) {
				const invoiceItem = await prisma.invoice_item.findUnique({
					where: {
						id: item.invoice_item_id,
					},
					include: {
						invoice: {
							include: {
								shop: true,
							},
						},
					},
				});
				if (!invoiceItem) {
					throw new Error("One of the invoice items do not exist");
				}
				if (invoiceItem.invoice.shop.name !== returnBill.shop_name) {
					throw new Error("One of the invoice items do not belong to the shop");
				}
				const returnItems = await prisma.return_bill_item.findMany({
					where: {
						invoice_item_id: item.invoice_item_id,
					},
				});
				const currentReturns = returnItems.reduce((acc, curr) => {
					return acc + curr.quantity;
				}, 0);
				///total quatity of with the return items with same invoice item id
				let totalQuantity = 0;
				returnBill.items.forEach((item: ReturnBillItemType) => {
					if (item.invoice_item_id === invoiceItem.id) {
						totalQuantity += item.quantity;
					}
				});
				if (totalQuantity + currentReturns > invoiceItem.quantity) {
					throw new Error(
						invoiceItem.product_key +
							" has only " +
							invoiceItem.quantity +
							" items in the invoice " +
							invoiceItem.invoice.id +
							" and " +
							currentReturns +
							" items are already returned"
					);
				}
				//price check
				if (item.price > invoiceItem.price) {
					throw new Error(
						"Price of the " +
							item.product_key +
							" is more than the original price"
					);
				}

				const savingItem: {
					product_key: string;
					quantity: number;
					price: number;
					invoice_item_id: number;
					invoice: number;
					reason: string;
					batch_id?: number;
				} = {
					product_key: invoiceItem.product_key,
					quantity: item.quantity,
					price: item.price,
					invoice_item_id: item.invoice_item_id,
					invoice: invoiceItem.invoice.id,
					reason: item.reason,
				};
				if (item.batch_id) {
					savingItem.batch_id = item.batch_id;
				}
				savingReturnBill.items.push(savingItem);
				itemCost += item.price * item.quantity;
			} else if (item.invoice_free_item_id) {
				const invoiceFreeItem = await prisma.free_item.findUnique({
					where: {
						id: item.invoice_free_item_id,
					},
					include: {
						invoice: {
							include: {
								shop: true,
							},
						},
					},
				});
				if (!invoiceFreeItem) {
					throw new Error("One of the invoice free items do not exist");
				}
				if (invoiceFreeItem.invoice.shop.name !== returnBill.shop_name) {
					throw new Error(
						"One of the invoice free items do not belong to the shop"
					);
				}
				const returnItems = await prisma.return_bill_item.findMany({
					where: {
						invoice_free_item_id: item.invoice_free_item_id,
					},
				});
				const currentReturns = returnItems.reduce((acc, curr) => {
					return acc + curr.quantity;
				}, 0);
				///total quatity of with the return items with same invoice item id
				let totalQuantity = 0;
				returnBill.items.forEach((item: ReturnBillItemType) => {
					if (item.invoice_free_item_id === invoiceFreeItem.id) {
						totalQuantity += item.quantity;
					}
				});
				if (
					totalQuantity + currentReturns >
					invoiceFreeItem.loose + invoiceFreeItem.packs * invoiceFreeItem.uom
				) {
					throw new Error(
						invoiceFreeItem.product_key +
							" has only " +
							invoiceFreeItem.loose +
							invoiceFreeItem.packs * invoiceFreeItem.uom +
							" items in the invoice " +
							invoiceFreeItem.invoice.id +
							" and " +
							currentReturns +
							" items are already returned"
					);
				}
				//price check
				//get the product default cost if batch id is not provided
				if (!item.batch_id) {
					const product = await prisma.product.findUnique({
						where: {
							key: invoiceFreeItem.product_key,
						},
					});
					if (!product) {
						throw new Error(invoiceFreeItem.product_key + " do not exist");
					}
					if (item.price > product.default_cost) {
						throw new Error(
							"Price of the " +
								item.product_key +
								" is more than the original price"
						);
					} else {
						//get the batch
						const batch = await prisma.batch.findUnique({
							where: {
								batch_id: item.batch_id,
							},
						});
						if (!batch) {
							throw new Error("Batch do not exist");
						}
						if (item.price > batch.cost) {
							throw new Error(
								"Price of the " +
									item.product_key +
									" is more than the original price"
							);
						}
					}

					const savingItem: {
						product_key: string;
						quantity: number;
						price: number;
						invoice_free_item_id: number;
						invoice: number;
						reason: string;
						batch_id?: number;
					} = {
						product_key: invoiceFreeItem.product_key,
						quantity: item.quantity,
						price: item.price,
						invoice_free_item_id: item.invoice_free_item_id,
						invoice: invoiceFreeItem.invoice.id,
						reason: item.reason,
					};
					if (item.batch_id) {
						savingItem.batch_id = item.batch_id;
					}
					savingReturnBill.items.push(savingItem);
					itemCost += item.price * item.quantity;
				} else {
					//get the product
					const product = await prisma.product.findUnique({
						where: {
							key: item.product_key,
						},
					});
					if (!product) {
						throw new Error(item.product_key + " do not exist");
					}
					//price check
					if (item.price > product.default_cost) {
						throw new Error(
							"Price of the " +
								item.product_key +
								" is more than the original price"
						);
					}
					const savingItem: {
						product_key: string;
						quantity: number;
						price: number;
						reason: string;
						batch_id?: number;
					} = {
						product_key: item.product_key,
						quantity: item.quantity,
						price: item.price,
						reason: item.reason,
					};
					savingReturnBill.items.push(savingItem);
					itemCost += item.price * item.quantity;
				}
			}else{
				//get the product
				const product = await prisma.product.findUnique({
					where: {
						key: item.product_key,
					},
				});
				if (!product) {
					throw new Error(item.product_key + " do not exist");
				}
				//price check
				if (item.price > product.default_labeled_price) {
					throw new Error(
						"Price of the " +
							item.product_key +
							" is more than the original price"
					);
				}

				const savingItem: {
					product_key: string;
					quantity: number;
					price: number;
					reason: string;
				} = {
					product_key: item.product_key,
					quantity: item.quantity,
					price: item.price,
					reason: item.reason,
				};
				savingReturnBill.items.push(savingItem);
				itemCost += item.price * item.quantity;
			}
		}
        savingReturnBill.items_cost = itemCost;
        savingReturnBill.value = itemCost - returnBill.deductions;
        const items = savingReturnBill.items;
        //remove items from return bill
        const savingReturnBillWithModifiedItems = {
            shop_name: savingReturnBill.shop_name,
            date: savingReturnBill.date,
            visit_id: savingReturnBill.visit_id,
            deductions: savingReturnBill.deductions,
            items_cost: savingReturnBill.items_cost,
            value: savingReturnBill.value,
            items:{
                create: items
            }
        };
        const savedReturnBill = await prisma.return_bill.create({
            data: savingReturnBillWithModifiedItems
        });
        return NextResponse.json({message:"Return bill saved successfully",savedReturnBill}, { status: 201 });
        
	} catch (e: any) {
		if (e && e.message) {
			return NextResponse.json({ message: e.message }, { status: 400 });
		}
		return NextResponse.json(
			{ message: "Unidentified Internal Server Error" },
			{ status: 500 }
		);
	}
}
