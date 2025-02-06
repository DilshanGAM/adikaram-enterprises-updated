"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import ReturnPickerTool from "@/components/returnPickerTool";
import { ReturnBillItemType, ReturnBillType } from "@/types/user";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ReturnBillSummary from "@/components/returnBillSummary";
import axios from "axios";
import toast from "react-hot-toast";

function ReturnsUIPage() {
	const searchParams = useSearchParams();
	const shopName = searchParams.get("shopName") || "";

	// Return Bill State
	const [returnBill, setReturnBill] = useState<ReturnBillType>({
		id: -99,
		shop_name: shopName || "",
		date: new Date(),
		visit_id: -99,
		status: "not-covered",
		deductions: 0,
    value: 0,
    items_cost: 0,
		covered_in: -99,
		items: [],
		payments: [],
	});
  const [recalculationPointer, setRecalculationPointer] = useState(false);
  useMemo(() => {
    let totalValue = 0;
    let totalItemsCost = 0;
    returnBill.items.forEach((item: ReturnBillItemType) => {
      totalValue += item.price * item.quantity;
      totalItemsCost += item.price * item.quantity;
    });
    setReturnBill({...returnBill, value: totalValue-returnBill.deductions, items_cost: totalItemsCost});
  }, [recalculationPointer,returnBill.deductions]);
  function recalculate(){
    setRecalculationPointer(!recalculationPointer);
  }

	// Function to remove item
	const handleRemoveItem = (index: number) => {
		const updatedItems = [...returnBill.items];
		updatedItems.splice(index, 1);
		setReturnBill({ ...returnBill, items: updatedItems });
    recalculate();
	};

	if (shopName == "") {
		return (
			<div className="text-center text-xl font-bold text-red-600">
				Shop not found
			</div>
		);
	}

  function handleSaveReturnBill(){
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    axios
      .post("/api/returnInvoicing", returnBill, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        console.log(response.data);
        toast.success("Return Bill Saved");
      }).catch((error) => {
        console.log(error);
        toast.error(error.response.data.message);
      });
  }

	return (
		<div className="w-full flex flex-col items-center h-screen p-6">
			<h1 className="text-3xl font-semibold text-pepsiBlue mb-4">Returns</h1>

			{/* Return Picker Tool */}
			<ReturnPickerTool recalculate={recalculate} returnBill={returnBill} setReturnBill={setReturnBill} />

			{/* Return Items Table */}
			<div className="w-full max-w-4xl overflow-auto mt-6 flex flex-col items-center">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product Key</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Reason</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{returnBill.items.length > 0 ? (
							returnBill.items.map((item, index) => (
								<TableRow key={index}>
									<TableCell>{item.product_key}</TableCell>
									<TableCell>{item.price.toFixed(2)}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>{item.reason}</TableCell>
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
								<TableCell colSpan={5} className="text-center">
									No return items added.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
        <ReturnBillSummary returnBill={returnBill} setReturnBill={setReturnBill} />
        <Button className="w-[448px]" onClick={handleSaveReturnBill}>Save Return Bill</Button>
			</div>
		</div>
	);
}

// Suspense Wrapper for Route Name Handling
export default function RouteNameWrapper() {
	return (
		<Suspense fallback={<div className="text-center">Loading...</div>}>
			<ReturnsUIPage />
		</Suspense>
	);
}
