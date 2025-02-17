"use client";

import Loading from "@/components/loading";
import OopsPage from "@/components/OopsPage";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IoPrintSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";

function ReturnBillPage() {
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [data, setData] = useState<any>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setStatus("error");
		} else {
			const returnBillId = searchParams.get("returnBillId") || "";
			axios
				.get(`/api/returnInvoicing/extended?id=${returnBillId}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res) => {
					console.log(res.data);
					setData(res.data);
					setStatus("success");
				})
				.catch(() => {
					setStatus("error");
				});
		}
	}, []);

	if (status === "loading") return <Loading />;
	if (status === "error") return <OopsPage message="Something went wrong" />;

	const { returnBill } = data;
	console.log(returnBill);
	// const invoiceTotal = invoice.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
	// const discountTotal = invoice.discount || 0;
	// const taxTotal = invoice.tax || 0;
	// const netTotal = invoiceTotal - discountTotal + taxTotal;

	return (
		<div className="w-full max-w-4xl mx-auto p-6 space-y-6">
			{/* ✅ Bill Summary Card */}
			<Card className="shadow-md relative">
				<CardHeader>
					<CardTitle className="text-xl">Return Invoice Details </CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<IoPrintSharp
							className="absolute right-1 top-1"
							onClick={() => {
								//tobechenged generateInvoicePDF(invoice);
							}}
						/>
						<p><span className="font-semibold">Shop Name:</span> {returnBill.shop.name}</p>
                        <p><span className="font-semibold">Shop Owner:</span> {returnBill.shop.owner}</p>
                        <p><span className="font-semibold">Visit Route:</span> {returnBill.visit.route_name}</p>
                        <p><span className="font-semibold">Visited By:</span> {returnBill.visit.visited_by}</p>
                        <p><span className="font-semibold">Invoice Date:</span> {new Date(returnBill.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Status:</span> {returnBill.status}</p> 
					</div>
				</CardContent>
			</Card>

			<Separator />

			{/* ✅ Invoice Items Table */}
			<h2 className="text-xl font-semibold text-pepsiBlue">Returned Items</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Product</TableHead>
						<TableHead>Batch ID</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Total</TableHead>
						<TableHead>Reason</TableHead>
						<TableHead>Bill Info</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{returnBill.items.length > 0 ? (
						returnBill.items.map((item: any, index: number) => {
							let type = "not-found";
							if (item.invoice_item) {
								type = "invoice_item";
							} else if (item.free_item) {
								type = "free_item";
							}
							return (
								<TableRow key={index}>
									<TableCell>{item.product.name}</TableCell>
									<TableCell>
										{(type === "invoice_item" &&
											item.invoice_item.batch?.batch_id) ||
											(type === "free_item" &&
												item.free_item.batch?.batch_id) ||
											"N/A"}
									</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>{item.price.toFixed(2)}</TableCell>
									<TableCell>
										{(item.price * item.quantity).toFixed(2)}
									</TableCell>
									<TableCell>{item.reason}</TableCell>
									<TableCell>
										{(type === "invoice_item" && (
											<div className="flex justify-between items-center ">
												{item.invoice_item.invoice_id}
												<a
													href={"/bill?billId=" + item.invoice_item.invoice_id}
													target="_blank"
												>
													<IoIosInformationCircleOutline />
												</a>
											</div>
										)) ||
											(type === "free_item" && (
												<div className="flex justify-between items-center">
													{item.free_item.invoice_id}
													<a
														href={"/bill?billId=" + item.free_item.invoice_id}
														target="_blank"
													>
														<IoIosInformationCircleOutline />
													</a>
												</div>
											)) ||
											"N/A"}
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={7} className="text-center">
								No items found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>


			

			<Separator />

			{/* ✅ Bill Summary */}
			<Card className="shadow-md">
				<CardHeader>
					<CardTitle className="text-xl">Bill Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
                        <p><span className="font-semibold">Total Amount: </span>{returnBill.items_cost.toFixed(2)}</p>
                        <p><span className="font-semibold">Deductions: </span> {returnBill.deductions.toFixed(2)}</p>
                        <p className="text-lg font-semibold"><span className="font-bold">Net Return Total:</span> {returnBill.value.toFixed(2)}</p> 
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
export default function RouteNameWrapper() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ReturnBillPage />
		</Suspense>
	);
}
