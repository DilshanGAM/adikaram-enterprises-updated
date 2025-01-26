"use client";

import React from "react";
import { DiscountModal } from "./discountModal";
import { InvoiceType } from "@/types/user";

export default function BillSummary({
	billSummary,
	invoice,
    setInvoice,
    setSummaryResetter,
    summaryResetter
}: {
	billSummary: any;
	invoice: any;
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
	setSummaryResetter: any;
	summaryResetter: any;
}) {
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
                <DiscountModal invoice={invoice} setInvoice={setInvoice} setSummaryResetter={setSummaryResetter} summaryResetter={summaryResetter} />
				<div className="flex items-center space-x-2">
					<h1 className="text-xl font-bold text-pepsiBlue">
						Total Price: {billSummary.totalPrice.toFixed(2)}
					</h1>
				</div>
			</div>
		</div>
	);
}
