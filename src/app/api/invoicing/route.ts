export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import {
	FreeItemType,
	InvoiceItemType,
	ProductType,
	UserType,
} from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	//get the user from the request header
	let userHeader = req.headers.get("user");
	let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;
	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
	//get if there is a active visit
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
			//get invoice from body
			const body = await req.json();

			console.log(body.shop_name);

			//check for each items in the invoice if the quantity is available in stock
			const items = body.items || [];
			const batchBasedItems = items.filter(
				(item: InvoiceItemType) => item.batch_id !== -99
			);
			const nonBatchBasedItems = items.filter(
				(item: InvoiceItemType) => item.batch_id === -99
			);
			const freeItems = body.freeItems || [];
			const batchBasedFreeItems = freeItems.filter(
				(item: FreeItemType) => item.batch_id !== -99
			);
			const nonBatchBasedFreeItems = freeItems.filter(
				(item: FreeItemType) => item.batch_id === -99
			);

			const allItemsCombined: { productKey: string; qty: number }[] = [];
			//batch based validation
			let nonBatchCombined: { productKey: string; qty: number }[] = [];
			let batchCombined: {
				productKey: string;
				batchId: number;
				qty: number;
			}[] = [];
			for (let i = 0; i < nonBatchBasedItems.length; i++) {
				//find the product available in nonBatchCombined
				const productIndex = nonBatchCombined.findIndex(
					(item) => item.productKey === nonBatchBasedItems[i].product_key
				);
				if (productIndex === -1) {
					nonBatchCombined.push({
						productKey: nonBatchBasedItems[i].product_key,
						qty: nonBatchBasedItems[i].quantity,
					});
				} else {
					nonBatchCombined[productIndex].qty += nonBatchBasedItems[i].quantity;
				}
				//update all batch combined
				const productIndexAll = allItemsCombined.findIndex(
					(item) => item.productKey === nonBatchBasedItems[i].product_key
				);
				if (productIndexAll === -1) {
					allItemsCombined.push({
						productKey: nonBatchBasedItems[i].product_key,
						qty: nonBatchBasedItems[i].quantity,
					});
				} else {
					allItemsCombined[productIndexAll].qty +=
						nonBatchBasedItems[i].quantity;
				}
			}
			for (let i = 0; i < nonBatchBasedFreeItems.length; i++) {
				//find the product available in nonBatchCombined
				const productIndex = nonBatchCombined.findIndex(
					(item) => item.productKey === nonBatchBasedFreeItems[i].product_key
				);
				if (productIndex === -1) {
					nonBatchCombined.push({
						productKey: nonBatchBasedFreeItems[i].product_key,
						qty: nonBatchBasedFreeItems[i].quantity,
					});
				} else {
					nonBatchCombined[productIndex].qty +=
						nonBatchBasedFreeItems[i].quantity;
				}
				//update all batch combined
				const productIndexAll = allItemsCombined.findIndex(
					(item) => item.productKey === nonBatchBasedFreeItems[i].product_key
				);
				if (productIndexAll === -1) {
					allItemsCombined.push({
						productKey: nonBatchBasedFreeItems[i].product_key,
						qty: nonBatchBasedFreeItems[i].quantity,
					});
				} else {
					allItemsCombined[productIndexAll].qty +=
						nonBatchBasedFreeItems[i].quantity;
				}
			}
			for (let i = 0; i < batchBasedItems.length; i++) {
				//find the product available in batchCombined
				const productIndex = batchCombined.findIndex(
					(item) =>
						item.productKey === batchBasedItems[i].product_key &&
						item.batchId === batchBasedItems[i].batch_id
				);
				if (productIndex === -1) {
					batchCombined.push({
						productKey: batchBasedItems[i].product_key,
						batchId: batchBasedItems[i].batch_id,
						qty: batchBasedItems[i].quantity,
					});
				} else {
					batchCombined[productIndex].qty += batchBasedItems[i].quantity;
				}
				//update all batch combined
				const productIndexAll = allItemsCombined.findIndex(
					(item) => item.productKey === batchBasedItems[i].product_key
				);
				if (productIndexAll === -1) {
					allItemsCombined.push({
						productKey: batchBasedItems[i].product_key,
						qty: batchBasedItems[i].quantity,
					});
				} else {
					allItemsCombined[productIndexAll].qty += batchBasedItems[i].quantity;
				}
			}
			for (let i = 0; i < batchBasedFreeItems.length; i++) {
				//find the product available in batchCombined
				const productIndex = batchCombined.findIndex(
					(item) =>
						item.productKey === batchBasedFreeItems[i].product_key &&
						item.batchId === batchBasedFreeItems[i].batch_id
				);
				if (productIndex === -1) {
					batchCombined.push({
						productKey: batchBasedFreeItems[i].product_key,
						batchId: batchBasedFreeItems[i].batch_id,
						qty: batchBasedFreeItems[i].quantity,
					});
				} else {
					batchCombined[productIndex].qty += batchBasedFreeItems[i].quantity;
				}
				//update all batch combined
				const productIndexAll = allItemsCombined.findIndex(
					(item) => item.productKey === batchBasedFreeItems[i].product_key
				);
				if (productIndexAll === -1) {
					allItemsCombined.push({
						productKey: batchBasedFreeItems[i].product_key,
						qty: batchBasedFreeItems[i].quantity,
					});
				} else {
					allItemsCombined[productIndexAll].qty +=
						batchBasedFreeItems[i].quantity;
				}
			}
			//validate stock and create bill
			try {
				return await prisma.$transaction(
					async (tx) => {
						// Fetch all products in a single batch operation
						const allProductsPromise = allItemsCombined.map((item) => {
							return tx.product.findFirst({
								where: {
									key: item.productKey,
								},
							});
						});

						const allProducts: any[] = await Promise.all(allProductsPromise);

						// Check stock availability
						for (let i = 0; i < allProducts.length; i++) {
							if (!allProducts[i]) {
								throw new Error(
									`Product with key ${allItemsCombined[i].productKey} not found`
								);
							}
							if (allProducts[i]!.stock < allItemsCombined[i].qty) {
								throw new Error(
									allItemsCombined[i].productKey +
										" quantity not available in stock"
								);
							}
						}
						// Check batch stock availability
						const allBatchesPromise = batchCombined.map((item) => {
							return tx.batch.findFirst({
								where: {
									batch_id: item.batchId,
								},
							});
						});
						const allBatches: any[] = await Promise.all(allBatchesPromise);
						for (let i = 0; i < batchCombined.length; i++) {
							if (!allBatches[i]) {
								throw new Error(
									`Batch with id ${batchCombined[i].batchId} not found`
								);
							}
							if (allBatches[i]!.stock < batchCombined[i].qty) {
								throw new Error(
									batchCombined[i].productKey +
										" quantity not available in stock"
								);
							}
						}
						// Update stock
						for (let i = 0; i < allProducts.length; i++) {
							await tx.product.update({
								where: {
									key: allItemsCombined[i].productKey,
								},
								data: {
									stock: {
										decrement: allItemsCombined[i].qty,
									},
								},
							});
						}
						// check if stock is less than 0
						const allProductsAfterUpdatePromise = allItemsCombined.map(
							(item) => {
								return tx.product.findFirst({
									where: {
										key: item.productKey,
									},
								});
							}
						);
						const allProductsAfterUpdate: any[] = await Promise.all(
							allProductsAfterUpdatePromise
						);
						for (let i = 0; i < allProductsAfterUpdate.length; i++) {
							if (allProductsAfterUpdate[i]!.stock < 0) {
								throw new Error(
									allItemsCombined[i].productKey +
										" quantity not available in stock"
								);
							}
						}
						// Update batch stock
						for (let i = 0; i < batchCombined.length; i++) {
							await tx.batch.update({
								where: {
									batch_id: batchCombined[i].batchId,
								},
								data: {
									remaining: {
										decrement: batchCombined[i].qty,
									},
								},
							});
						}
						// check if batch remaining is less than 0
						const allBatchesAfterUpdatePromise = batchCombined.map((item) => {
							return tx.batch.findFirst({
								where: {
									batch_id: item.batchId,
								},
							});
						});
						const allBatchesAfterUpdate: any[] = await Promise.all(
							allBatchesAfterUpdatePromise
						);
						for (let i = 0; i < allBatchesAfterUpdate.length; i++) {
							if (allBatchesAfterUpdate[i]!.remaining < 0) {
								throw new Error(
									batchCombined[i].productKey +
										" quantity not available in stock"
								);
							}
						}
						//remove id and invoice_id from items
						const items = body.items.map((item: InvoiceItemType) => {
							if (item.batch_id === -99) {
								return {
									product_key: item.product_key,
									uom: item.uom,
									packs: item.packs,
									loose: item.loose,
									quantity: item.quantity,
									price: item.price,
								};
							} else {
								return {
									product_key: item.product_key,
									batch_id: item.batch_id,
									uom: item.uom,
									packs: item.packs,
									loose: item.loose,
									quantity: item.quantity,
									price: item.price,
								};
							}
						});
						//remove id and invoice_id from freeItems
						const freeItems = body.freeItems.map((item: FreeItemType) => {
							if (item.batch_id === -99) {
								return {
									product_key: item.product_key,
									uom: item.uom,
									packs: item.packs,
									loose: item.loose,
								};
							} else {
								return {
									product_key: item.product_key,
									batch_id: item.batch_id,
									uom: item.uom,
									packs: item.packs,
									loose: item.loose,
								};
							}
						});

						// Create invoice
						const invoice = await tx.invoice.create({
							data: {
								shop_name: body.shop_name,
								visit_id: startedVisit.id,
								type: body.type,
								status: body.status,
								tax: body.tax,
								discount: body.discount,
								items: {
									create: items,
								},
								free_items: {
									create: freeItems,
								},
							},
						});
						return NextResponse.json({
							invoice,
							message: "Invoice created successfully",
						});
					},
					{
						timeout: 30000,
					}
				);
			} catch (e: any) {
				return NextResponse.json({ message: e.message }, { status: 500 });
			}
		} else {
			return NextResponse.json(
				{ message: "No visit started" },
				{ status: 403 }
			);
		}
	} catch (e: any) {
		return NextResponse.json({ message: e.message }, { status: 500 });
	}
}
