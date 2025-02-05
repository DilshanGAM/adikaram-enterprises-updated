"use client";

import { useState } from "react";
import { ReturnBillType } from "@/types/user";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReturnBillSummary({
	returnBill,
	setReturnBill,
}: {
	returnBill: ReturnBillType;
	setReturnBill: (bill: ReturnBillType) => void;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [deductionAmount, setDeductionAmount] = useState(returnBill.deductions);

	// Function to handle deduction update
    const handleDeductionChange = (e: any) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) {
            setDeductionAmount(0);
        } else {
            setDeductionAmount(val);
        }
    }
	const handleSaveDeduction = () => {
      
            setReturnBill({ ...returnBill, deductions: deductionAmount });        
		    setIsModalOpen(false);
        
		
	};

	return (
		<div className="w-full mx-auto my-2 max-w-md bg-white p-4 rounded-lg shadow-lg">
			<h2 className="text-xl font-bold text-pepsiBlue">Return Bill Summary</h2>

			<div className="mt-4 space-y-2 text-gray-700">
				<p>
					<span className="font-semibold">Total Return Amount:</span> {returnBill.items_cost.toFixed(2)}
				</p>
				<p>
					<span className="font-semibold">Total Items:</span> {returnBill.items.length}
				</p>
				<p>
					<span className="font-semibold cursor-pointer text-blue-500 hover:underline" onClick={() => setIsModalOpen(true)}>
						Deductions:
					</span>{" "}
					{returnBill.deductions.toFixed(2)}
				</p>
				<p>
					<span className="font-semibold">Final Amount:</span> {(returnBill.value).toFixed(2)}
				</p>
			</div>

			{/* Deduction Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Deductions</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-gray-600">Enter the deduction amount:</p>
						<Input
							type="number"
							value={deductionAmount}
							onChange={handleDeductionChange}
							placeholder="Enter amount"
						/>
					</div>
					<DialogFooter>
						<Button variant="secondary" onClick={() => setIsModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveDeduction}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
