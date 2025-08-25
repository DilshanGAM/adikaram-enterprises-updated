"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import Time from "@/components/time";
import { Button } from "@/components/ui/button";
import ProductAddingModal from "@/components/productAddingModal";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InvoiceType } from "@/types/user";
import axios from "axios";
import UpdateBillSummary from "@/components/updateBillSummary";

function UpdateBillUI() {
	const searchParams = useSearchParams();

	const billId = searchParams.get("billId");
	const [summaryResetter, setSummaryResetter] = useState<boolean>(false);
	const [shopName, setShopName] = useState<string | null>(null);
	useEffect(() => {
		axios
			.get("/api/invoicing/extended", {
				params: {
					id: billId,
				},
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then((res) => {
				if (res.data.invoice) {
					setInvoice(res.data.invoice);
					setShopName(res.data.invoice.shop_name);
					summaryResetter ? setSummaryResetter(false) : setSummaryResetter(true);
					console.log(res);
				} else {
					console.error("No invoice data found");
				}
			});
	}, []);
	const [invoice, setInvoice] = useState<InvoiceType>({
		shop_name: shopName || "",
		visit_id: -99,
		discount: 0,
		type: "on-delivery",
		status: "not-paid",
		tax: 0,
		items: [],
		freeItems: [],
	});
	const billSummary = useMemo(() => {
		let totalItems = 0;
		if (invoice.items)
			totalItems = invoice.items.reduce((acc, item) => acc + item.quantity, 0);
		let totalFreeItems = 0;
		if (invoice.freeItems)
			totalFreeItems = invoice.freeItems.reduce(
				(acc, item) => acc + item.quantity,
				0
			);
		let grossTotalPrice = 0;
		if (invoice.items)
			grossTotalPrice = invoice.items.reduce(
				(acc, item) => acc + item.price * item.quantity,
				0
			);
		const discount = invoice.discount || 0;
		const totalPrice = grossTotalPrice - discount;
		return {
			totalItems,
			totalFreeItems,
			grossTotalPrice,
			discount,
			totalPrice,
		};
	}, [summaryResetter]);

	const handleRemoveItem = (index: number) => {
		const updatedItems = [...(invoice.items || [])];
		updatedItems.splice(index, 1);
		setInvoice({ ...invoice, items: updatedItems });
		setSummaryResetter(!summaryResetter);
	};
	const handleRemoveFreeItem = (index: number) => {
		const updatedItems = [...(invoice.freeItems || [])];
		updatedItems.splice(index, 1);
		setInvoice({ ...invoice, freeItems: updatedItems });
		setSummaryResetter(!summaryResetter);
	};

	return (
		<div
			className="w-full max-h-[calc(100vh-60px)] h-[calc(100vh-60px)] px-7
         flex flex-col items-center "
		>
			<div className="w-full flex flex-col items-center space-y-4">
				<h1 className="text-4xl font-bold text-pepsiBlue">
					Shop name : {shopName}
				</h1>
				<Time />
			</div>
			<Separator className="h-1 w-full" orientation="horizontal" />

			{/* bill items */}
			<div className="w-full flex flex-col items-center space-y-4">
				<h1 className="text-2xl font-bold text-pepsiBlue">Bill Items</h1>

				{/* modal */}
				<ProductAddingModal
					setInvoice={setInvoice}
					invoice={invoice}
					isFreeIssue={false}
					setSummaryResetter={setSummaryResetter}
					summaryResetter={summaryResetter}
				/>

				{/* table */}
				<div className="w-full overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product Key</TableHead>
								<TableHead>Batch ID</TableHead>
								<TableHead>UOM</TableHead>
								<TableHead>Packs</TableHead>
								<TableHead>Loose</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoice.items?.length ? (
								invoice.items.map((item, index) => (
									<TableRow key={index}>
										<TableCell>{item.product_key}</TableCell>
										<TableCell>
											{!item.batch_id || item.batch_id == -99
												? "N/A"
												: item.batch_id}
										</TableCell>
										<TableCell>{item.uom}</TableCell>
										<TableCell>{item.packs}</TableCell>
										<TableCell>{item.loose}</TableCell>
										<TableCell>{item.quantity}</TableCell>
										<TableCell>{item.price}</TableCell>
										<TableCell>{item.price * item.quantity}</TableCell>
										<TableCell>
											<Button
												variant="destructive"
												onClick={() => handleRemoveItem(index)}
											>
												Remove
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										No items added yet.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<Separator className="h-1 w-full" orientation="horizontal" />
			<div className="w-full flex flex-col items-center space-y-4">
				<h1 className="text-2xl font-bold text-pepsiBlue">Free Issues</h1>
				{/* modal */}
				<ProductAddingModal
					setInvoice={setInvoice}
					invoice={invoice}
					isFreeIssue={true}
					setSummaryResetter={setSummaryResetter}
					summaryResetter={summaryResetter}
				/>
				{/* table */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product Key</TableHead>
							<TableHead>Batch ID</TableHead>
							<TableHead>UOM</TableHead>
							<TableHead>Packs</TableHead>
							<TableHead>Loose</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Total</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoice.freeItems?.length ? (
							invoice.freeItems.map((item, index) => (
								<TableRow key={index}>
									<TableCell>{item.product_key}</TableCell>
									<TableCell>
										{!item.batch_id || item.batch_id == -99
											? "N/A"
											: item.batch_id}
									</TableCell>
									<TableCell>{item.uom}</TableCell>
									<TableCell>{item.packs}</TableCell>
									<TableCell>{item.loose}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>Free</TableCell>
									<TableCell>Free</TableCell>
									<TableCell>
										<Button
											variant="destructive"
											onClick={() => handleRemoveFreeItem(index)}
										>
											Remove
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="text-center">
									No items added yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<Separator className="h-1 w-full" orientation="horizontal" />
			<UpdateBillSummary
				billSummary={billSummary}
				setInvoice={setInvoice}
				invoice={invoice}
				setSummaryResetter={setSummaryResetter}
				summaryResetter={summaryResetter}
			/>
		</div>
	);
}
export default function RouteNameWrapper() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<UpdateBillUI />
		</Suspense>
	);
}
