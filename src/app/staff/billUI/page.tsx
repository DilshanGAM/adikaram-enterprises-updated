"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import Time from "@/components/time";
import { Button } from "@/components/ui/button";
import ProductAddingModal from "@/components/productAddingModal";
import { InvoiceType } from "@/types/user";

export default function BillUI() {
	const searchParams = useSearchParams();
	const shopName = searchParams.get("shopName");
	const [loading, setLoading] = useState(true);
	const [bill, setBill] = useState(null);
	const [invoice, setInvoice] = useState<InvoiceType>({
		shop_name: shopName || "",
		visit_id: -99,
		discount: 0,
		type: "on-delivery",
		status: "not-paid",
		tax: 0,
		items: [],
		freeItems: []
	});
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
				<ProductAddingModal setInvoice={setInvoice} invoice={invoice} />
			</div>
		</div>
	);
}
