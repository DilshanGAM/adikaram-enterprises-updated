"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { IoIosInformationCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";

export default function BillPayModalStaff({
	modalOpen,
	setModalOpen,
	bill,
	shopName,
	reloadPage,
}: {
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	bill: any;
	shopName: string;
	reloadPage: () => void;
}) {
	const [amount, setAmount] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [selectedMethod, setSelectedMethod] = useState<"cash" | "return-bill">(
		"cash"
	);
	const [returnBillStatus, setReturnBillStatus] = useState<
		"loading" | "error" | "success"
	>("loading");
	const [returnBills, setReturnBills] = useState<any[]>([]);
	const [returnBillId, setReturnBillId] = useState<number>(-99);

	const handlePay = async () => {
		let paymentPayload;
		if (selectedMethod === "cash") {
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
		const token = localStorage.getItem("token");
		try {
			const response = await axios.post("/api/payment", paymentPayload, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log(response.data);
			toast.success("Bill paid successfully");
			setReturnBillStatus("loading");
			reloadPage();
		} catch (e:any) {
			toast.error(e?.response?.data?.message||"Failed to pay bill");
		}
		setModalOpen(false); // Close the modal
	};

	useEffect(() => {
		if (returnBillStatus === "loading") {
			const token = localStorage.getItem("token");
			axios
				.get(`/api/returnInvoicing/notCovered?shopName=${shopName}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					setReturnBills(res.data.notCoveredReturnBills);
					setReturnBillStatus("success");
				})
				.catch((err) => {
					console.error(err);
					setReturnBillStatus("error");
				});
		}
	}, [returnBillStatus, shopName]);

	return (
		<Dialog open={modalOpen} onOpenChange={setModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Pay Bill - Invoice #{bill.bill.id}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<p className="text-gray-600">
						Total Bill Value: <strong>{bill.value.toFixed(2)}</strong>
					</p>
					<p className="text-gray-600">
						Total Paid: <strong>{bill.totalPaid.toFixed(2)}</strong>
					</p>
					<p className="text-gray-600">
						Remaining Amount:{" "}
						<strong>{(bill.value - bill.totalPaid).toFixed(2)}</strong>
					</p>

					{/* Payment Method Selection */}
					<div className="flex space-x-2">
						<Button
							variant={selectedMethod === "cash" ? "default" : "secondary"}
							onClick={() => setSelectedMethod("cash")}
							className={cn(
								selectedMethod === "cash" && "bg-pepsiBlue text-white"
							)}
						>
							Cash
						</Button>
						<Button
							variant={
								selectedMethod === "return-bill" ? "default" : "secondary"
							}
							onClick={() => setSelectedMethod("return-bill")}
							className={cn(
								selectedMethod === "return-bill" && "bg-pepsiBlue text-white"
							)}
						>
							Return Bill
						</Button>
					</div>

					{/* Conditional Content */}
					{selectedMethod === "cash" ? (
						<div className="space-y-2">
							<Input
								type="number"
								placeholder="Enter payment amount"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="mt-2"
							/>
							<Input
								type="text"
								placeholder="Enter notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="mt-2"
							/>
						</div>
					) : (
						<div className="overflow-auto max-h-64">
							<h2 className="text-lg font-semibold text-gray-800 mb-2">
								Return Bills
							</h2>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead></TableHead>
										<TableHead>Return Bill ID</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>value</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{returnBills.length > 0 ? (
										returnBills.map((returnBill) => (
											<TableRow key={returnBill.id}>
												<TableCell>
													<Input
														type="radio"
														name="returnBill"
														value={returnBill.id}
														onChange={(e) =>
															setReturnBillId(parseInt(e.target.value))
														}
													/>
												</TableCell>
												<TableCell>
													<a
														href={"/returnBill?returnBillId=" + returnBill.id}
														target="_blank"
													>
														<div className="flex items-center">
															{returnBill.id}
															<IoIosInformationCircleOutline />
														</div>
													</a>
												</TableCell>
												<TableCell>
													{new Date(returnBill.date).toLocaleDateString()}
												</TableCell>
												<TableCell>{returnBill.value.toFixed(2)}</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={5} className="text-center">
												No return bills found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="secondary" onClick={() => setModalOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="default"
						onClick={handlePay}
						disabled={
							selectedMethod === "cash" && (!amount || parseFloat(amount) <= 0)
						}
					>
						{selectedMethod === "cash" ? "Pay by cash" : "Pay by return bill"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
