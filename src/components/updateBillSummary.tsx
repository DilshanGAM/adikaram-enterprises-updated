"use client";

import React, { useState } from "react";
import { DiscountModal } from "./discountModal";
import { InvoiceType } from "@/types/user";
import { Button } from "./ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UpdateBillSummary({
	billSummary,
	invoice,
	setInvoice,
	setSummaryResetter,
	summaryResetter,
}: {
	billSummary: any;
	invoice: any;
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
	setSummaryResetter: any;
	summaryResetter: any;
}) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	async function saveBill() {
		setLoading(true);
		const token = localStorage.getItem("token");
		try {
			const res = await axios.put("/api/invoicing/updateBill", invoice, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
                params: {
                    id: invoice.id,
                },
			});
			setLoading(false);
			console.log(res);
			toast.success("Bill saved successfully");
			router.push("/staff");
		} catch (err) {
			setLoading(false);
			toast.error("Failed to save bill");
			console.log(err);
		}
	}
	return (
		<div className="w-full flex flex-col items-center space-y-4">
			<h1 className="text-2xl font-bold text-pepsiBlue">Bill Summary</h1>
			<div className="flex flex-col items-end space-y-4">
				<h1 className="text-xl font-bold text-pepsiBlue">
					Total Items: {billSummary.totalItems}
				</h1>
				<h1 className="text-xl font-bold text-pepsiBlue">
					Total Free Items: {billSummary.totalFreeItems}
				</h1>
				{/* gross total */}
				<h1 className="text-xl font-bold text-pepsiBlue">
					Gross Total: {billSummary.grossTotalPrice.toFixed(2)}
				</h1>
				<DiscountModal
					invoice={invoice}
					setInvoice={setInvoice}
					setSummaryResetter={setSummaryResetter}
					summaryResetter={summaryResetter}
				/>
				<div className="flex items-center space-x-2">
					<h1 className="text-xl font-bold text-pepsiBlue">
						Total Price: {billSummary.totalPrice.toFixed(2)}
					</h1>
				</div>
				<Button disabled={loading} onClick={saveBill}>Print Bill</Button>
			</div>
		</div>
	);
}
