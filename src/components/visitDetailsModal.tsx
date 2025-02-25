"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VisitType } from "@/types/user";
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

export default function VisitDetailsModal({
	visit,
	onClose,
    reload
}: {
	visit: VisitType;
	onClose: () => void;
    reload: () => void;
}) {
	const [activeTab, setActiveTab] = useState("bills");
	const [billDetails, setBillDetails] = useState<any>(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		axios
			.get(`/api/visit/extended?visitId=${visit.id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				setBillDetails(res.data.details);
				console.log(res.data.details);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="">
				<DialogHeader>
					<DialogTitle>Visit Details - {visit.route_name}</DialogTitle>
				</DialogHeader>

				{/* Show loading if data is not available */}
				{!billDetails ? (
					<h1 className="text-xl font-semibold text-center">Loading...</h1>
				) : (
					<>
						{/* Tabs */}
						<div className="flex justify-between space-x-2">
							{["bills", "payments", "summary"].map((tab) => (
								<Button
									key={tab}
									variant="ghost"
									onClick={() => setActiveTab(tab)}
									className={cn(
										"w-full px-4 py-2 rounded-md hover:bg-pepsiBlue hover:text-white",
										activeTab === tab
											? "bg-pepsiBlue text-white"
											: "bg-gray-200 text-black"
									)}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Button>
							))}
						</div>

						<Separator />

						{/* Tab Content */}
						<div className="p-4">
							{activeTab === "bills" && (
								<BillsContent bills={billDetails.bills} />
							)}
							{activeTab === "payments" && (
								<PaymentsContent payments={billDetails.payments} />
							)}
							{activeTab === "summary" && (
								<SummaryContent summary={billDetails.summary} />
							)}
							<ConfirmModal
								open={confirmModalOpen}
								onOpenChange={setConfirmModalOpen}
								onConfirm={() => {
									setConfirmModalOpen(false);
									onClose();
								}}
								visit={visit}
                                reload={reload}
							/>
						</div>
					</>
				)}

				<DialogFooter>
					<Button variant="secondary" onClick={onClose}>
						Close
					</Button>
					{visit.status === "started" && (
						<Button variant="default" onClick={() => setConfirmModalOpen(true)}>
							Finish Visit
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* ✅ Bills Table Component */
function BillsContent({ bills }: { bills: any[] }) {
	return (
		<div className="overflow-auto">
			<h2 className="text-lg font-semibold text-pepsiBlue mb-4">Bills</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Invoice ID</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Total</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{bills.length > 0 ? (
						bills.map((bill, index) => (
							<TableRow key={index}>
								<TableCell>{bill.invoice.id}</TableCell>
								<TableCell>
									{new Date(bill.invoice.date).toLocaleDateString()}
								</TableCell>
								<TableCell>{bill.total.toFixed(2)}</TableCell>
								<TableCell>
									<a href={"/bill?billId=" + bill.invoice.id} target="_blank">
										<IoIosInformationCircleOutline />
									</a>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={3} className="text-center">
								No bills found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

/* ✅ Payments Table Component */
function PaymentsContent({ payments }: { payments: any[] }) {
	return (
		<div className="overflow-auto">
			<h2 className="text-lg font-semibold text-pepsiBlue mb-4">Payments</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Payment ID</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Type</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{payments.length > 0 ? (
						payments.map((payment, index) => (
							<TableRow key={index}>
								<TableCell>{payment.id}</TableCell>
								<TableCell>
									{new Date(payment.date).toLocaleDateString()}
								</TableCell>
								<TableCell>{payment.amount.toFixed(2)}</TableCell>
								<TableCell>{payment.type}</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4} className="text-center">
								No payments found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

/* ✅ Summary Information */
function SummaryContent({ summary }: { summary: any }) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-pepsiBlue">Visit Summary</h2>
			<div className="text-gray-700 text-md space-y-2">
				<p>
					<span className="font-semibold">Total Bills:</span>{" "}
					{summary.billCount}
				</p>
				<p>
					<span className="font-semibold">Total Bill Amount:</span>{" "}
					{summary.billTotal.toFixed(2)}
				</p>
				<p>
					<span className="font-semibold">Total Payments:</span>{" "}
					{summary.paymentCount}
				</p>
				<p>
					<span className="font-semibold">Total Payment Amount:</span>{" "}
					{summary.paymentTotal.toFixed(2)}
				</p>
				<p>
					<span className="font-semibold">Cash in Hand:</span>{" "}
					{summary.cashInHand.toFixed(2)}
				</p>
				<p>
					<span className="font-semibold">Total Return Bills:</span>{" "}
					{summary.returnBillCount}
				</p>
				<p>
					<span className="font-semibold">Total Return Bill Amount:</span>{" "}
					{summary.returnBillTotal.toFixed(2)}
				</p>
			</div>
		</div>
	);
}
function ConfirmModal({
	open,
	onOpenChange,
	onConfirm,
	visit,
    reload
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	visit: any;
    reload: () => void;
}) {
    const [loading, setLoading] = useState(false);
	function handleConfirm() {
        setLoading(true);
		const token = localStorage.getItem("token");
		axios
			.put(
				`/api/visit?id=${visit.id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then((res) => {
                setLoading(false);
				console.log(res.data);
				onConfirm();
                reload();
			})
			.catch((err) => {
                setLoading(false);
				console.error(err);
                toast.error("Failed to finish visit");
			});
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Finish Visit</DialogTitle>
				</DialogHeader>
				<p className="text-lg font-semibold text-center">
					Are you sure you want to finish this visit?
				</p>
				<DialogFooter>
					<Button disabled={loading} variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button disabled={loading} variant="default" onClick={handleConfirm}>
						Finish Visit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
