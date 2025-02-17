"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import { Button } from "@/components/ui/button";
import { ShopFinder } from "./shopFinder";
import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import toast from "react-hot-toast";
import { isValid } from "date-fns";

export default function AddDriverPaymentModal({
	modalOpen,
	setModalOpen,
	reloader,
}: {
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	reloader: () => void;
}) {
	const [shopName, setShopName] = useState<string>("");
	const [shopLoaded, setShopLoaded] = useState<boolean>(false);
	const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
	const [invoicesLoaded, setInvoicesLoaded] = useState<string>("not-loaded"); //loading loaded error
	const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>(-99);
	const [amount, setAmount] = useState<number>(0);
	const [notes, setNotes] = useState<string>("");
	function loadUnpaidInvoices() {
		if (shopLoaded) {
			setInvoicesLoaded("loading");
			const token = localStorage.getItem("token");
			if (!token) {
				return;
			}
			axios
				.get("/api/invoicing/unpaidBills?shopName=" + shopName, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					console.log(res.data.bills);
					setUnpaidInvoices(res.data.bills);
					setInvoicesLoaded("loaded");
				})
				.catch((err) => {
					console.error(err);
					setInvoicesLoaded("error");
				});
		}
	}
    function addPayment(){
        if(selectedInvoiceId === -99){
            toast.error("Please select an invoice to pay");
            return;
        }
        if(amount <= 0){
            toast.error("Please enter a valid amount");
            return;
        }
        const token = localStorage.getItem("token");
        if(!token){
            toast.error("Unauthorized");
            return;
        }
        /**
         * shop_name: shopName,
				invoice_id: bill.bill.id,
				amount: parseFloat(amount),
				isValid: true,
				notes: notes,
				visitType: "staff-visit",
         */
        axios.post("/api/payment",{
            shop_name: shopName,
            invoice_id: selectedInvoiceId,
            amount: amount,
            isValid: true,
            notes: notes,
            visitType: "driver-visit"
        },{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res)=>{
            toast.success("Payment added successfully");
            setModalOpen(false);
            reloader();
        }).catch((err)=>{
            toast.error(err?.response?.data?.message||"Failed to add payment");
        });
    }
	return (
		<Dialog open={modalOpen} onOpenChange={setModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add payment</DialogTitle>
				</DialogHeader>
				<div className="text-gray-600">
					<ShopFinder
						selectShop={(shop: any) => {
                            setSelectedInvoiceId(-99);
							setShopName(shop.name);
							setShopLoaded(true);
							loadUnpaidInvoices();
						}}
					/>
				</div>
				<Input
					type="number"
					placeholder="Amount"
					value={amount}
					onChange={(e) => {
                        let val = parseFloat(e.target.value);
                        if(isNaN(val)){
                            val = 0;
                        }
						setAmount(val);
					}}
                    disabled={selectedInvoiceId === -99}
				/>
				<Label>Notes</Label>
				<Textarea
					placeholder="Enter notes here"
					value={notes}
					onChange={(e) => {
						setNotes(e.target.value);
					}}
                    disabled={selectedInvoiceId === -99}
				/>
				{invoicesLoaded === "loading" && <p>Loading...</p>}
				{invoicesLoaded === "error" && (
					<p className="text-red-500">
						Failed to load invoices. Please try again later.
					</p>
				)}
				{invoicesLoaded === "loaded" && (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead></TableHead>
								<TableHead>Invoice ID</TableHead>
								<TableHead>Total Payment</TableHead>
								<TableHead>Paid amount</TableHead>
								<TableHead>Outstanding</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{unpaidInvoices.map((invoice) => (
								<TableRow key={invoice.id}>
									<TableCell>
										<Input
											type="radio"
											name="invoice"
											value={invoice.id}
											onChange={(e) =>
												{console.log(parseInt(invoice.bill.id))
                                                setSelectedInvoiceId(parseInt(invoice.bill.id))}
											}
										/>
									</TableCell>
									<TableCell>{invoice.bill.id}</TableCell>
									<TableCell>{invoice.value}</TableCell>
									<TableCell>{invoice.totalPaid}</TableCell>
									<TableCell>{invoice.value - invoice.totalPaid}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}

				<DialogFooter>
					<Button variant="default" onClick={() => setModalOpen(false)}>
						Close
					</Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            addPayment();
                        }}
                    >
                        Add payment
                    </Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
/**
 * if (selectedMethod === "cash") {
			paymentPayload = {
				shop_name: shopName,
				invoice_id: bill.bill.id,
				amount: parseFloat(amount),
				isValid: true,
				notes: notes,
				visitType: "staff-visit",
			};
		} else {
			paymentPayload = {
				shop_name: shopName,
				invoice_id: bill.bill.id,
				isValid: true,
				return_bill_id: returnBillId,
				visitType: "staff-visit",
			};
		}
 */
