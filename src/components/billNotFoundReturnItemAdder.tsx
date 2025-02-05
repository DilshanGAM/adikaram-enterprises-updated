"use client";

import { useState } from "react";
import { ProductFinder } from "./productFinder";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select } from "@radix-ui/react-select";
import {
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { ReturnBillType } from "@/types/user";
import toast from "react-hot-toast";

export default function BillNotFoundReturnItemAdder({
	returnBill,
	setReturnBill,
	modalOpen,
	setModalOpen,
	recalculate
}: {
	returnBill: any;
	setReturnBill: any;
	modalOpen: boolean;
	setModalOpen: any;
	recalculate: any;
}) {
	const [selectedProduct, setSelectedProduct] = useState<any>(null);
	const [qty, setQty] = useState(0);
	const [price, setPrice] = useState(0);
	const [reason, setReason] = useState("");
	function selectProduct(product: any) {
		setSelectedProduct(product);
		setPrice(product.default_cost);
		console.log(product);
	}
	function changeQty(e: any) {
		const val = parseInt(e.target.value);
		if (isNaN(val)) {
			setQty(0);
		} else {
			setQty(val);
		}
	}
	function changePrice(e: any) {
		const val = parseInt(e.target.value);
		if (isNaN(val)) {
			setPrice(0);
		} else {
			setPrice(val);
		}
	}
	function handleReasonChange(e: any) {
		setReason(e);
	}
	function handleConfirm() {
        if(qty === 0){
            toast.error("Quantity cannot be 0");
            return;
        }
        if(price === 0){
            toast.error("Price cannot be 0");
            return;
        }
        if(reason === ""){
            toast.error("Reason cannot be empty");
            return;
        }
		if (selectedProduct) {
            
			const newReturnBill:ReturnBillType = { ...returnBill };
			newReturnBill.items.push({
                id:-99,
                return_bill_id: -99,
                product_key: selectedProduct.key,
                batch_id: selectedProduct.batch_id,
                quantity: qty,
                price: price,
                reason: reason,
			});
			setReturnBill(newReturnBill);
			setModalOpen(false);
			recalculate();
		}
	}
	function modalOpenChange(val: boolean) {
		setModalOpen(val);
		if (!val) {
			setSelectedProduct(null);
			setQty(0);
			setPrice(0);
			setReason("");
		}
	}

	return (
		<Dialog open={modalOpen} onOpenChange={modalOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Return Item Picker</DialogTitle>
				</DialogHeader>
				<ProductFinder openView={selectProduct} />
				{selectedProduct ? (
					<>
						<Label>
							Quantity
							<Input type="number" value={qty} onChange={changeQty} />
						</Label>
						<Label>
							Price
							<Input type="number" value={price} onChange={changePrice} />
						</Label>
						<Label>
							Reason
							<Select value={reason} onValueChange={handleReasonChange}>
								<SelectTrigger className="w-full">
									<SelectValue>{reason}</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Reason</SelectLabel>
										<SelectItem value="expired">Expired</SelectItem>
										<SelectItem value="gas-leak">Gas Leak</SelectItem>
										<SelectItem value="damaged">Damaged</SelectItem>
										<SelectItem value="wrong-item">Wrong Item</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</Label>
					</>
				) : (
					<h1 className="text-center">Please select a product to proceed</h1>
				)}
				<DialogFooter>
					<Button variant="secondary" onClick={() => {}}>
						Cancel
					</Button>
					<Button disabled={selectedProduct === null} onClick={handleConfirm}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
