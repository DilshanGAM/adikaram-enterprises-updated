"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/loading";
import AddDriverPaymentModal from "@/components/addDriverPaymentModal";

export default function DriverVisitsPage() {
	const [driverVisit, setDriverVisit] = useState<any>(null);
	const [status, setStatus] = useState<string>("loading"); // loaded, error, not-found
	const [resetPointer, setResetPointer] = useState<boolean>(false);
	const [driverName, setDriverName] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [startVisitLoading, setStartVisitLoading] = useState<boolean>(false);
    const [addPaymentModalOpen, setAddPaymentModalOpen] = useState<boolean>(false);
	const reload = () => setResetPointer(!resetPointer);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setStatus("error");
			return;
		}
		axios
			.get("/api/driverVisits", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				setDriverVisit(res.data.driverVisit);
				setStatus("loaded");
			})
			.catch((err) => {
				const message = err.response?.data?.message || "Something went wrong";
				if (message === "No any processing driver visit found") {
					setStatus("not-found");
				} else {
					setStatus("error");
				}
				toast.error(message);
			});
	}, [resetPointer]);

	const handleStartVisit = () => {
		setStartVisitLoading(true);
		const token = localStorage.getItem("token");
		axios
			.post(
				"/api/driverVisits/",
				{ driver_name: driverName, notes },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(() => {
				setStartVisitLoading(false);
				toast.success("Driver visit started successfully");
				reload();
			})
			.catch((err) => {
				setStartVisitLoading(false);
				const message = err.response?.data?.message || "Failed to start visit";
				toast.error(message);
			});
	};

	return (
		<div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
			{status === "loading" && <Loading />}

			{status === "loaded" && (
				<Card className="w-full max-w-2xl ">
					<CardHeader>
						<CardTitle className="text-lg font-bold text-gray-800">
							Driver Visit Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p>
							<strong>Driver Name:</strong> {driverVisit.driver_name}
						</p>
						<p>
							<strong>Verified By:</strong> {driverVisit.verified_by}
						</p>
						<p>
							<strong>Date:</strong>{" "}
							{new Date(driverVisit.date).toLocaleString()}
						</p>
						<p>
							<strong>Status:</strong>{" "}
							<span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
								{driverVisit.status}
							</span>
						</p>
						<p>
							<strong>Notes:</strong> {driverVisit.notes}
						</p>
						<Separator />
						<h3 className="text-md font-semibold text-gray-800">Payments</h3>
						<Button onClick={
                            () => setAddPaymentModalOpen(true)
                        }>Add Payment</Button>
                        <AddDriverPaymentModal modalOpen={addPaymentModalOpen} setModalOpen={setAddPaymentModalOpen} reloader={reload} />
						{driverVisit.payments.length === 0 ? (
							<p className="text-gray-600">
								No payments recorded for this visit.
							</p>
						) : (
							<ul className="list-disc list-inside">
								{driverVisit.payments.map((payment: any) => (
									<li key={payment.id}>
										Payment #{payment.id} - ${payment.amount.toFixed(2)} on{" "}
										{new Date(payment.date).toLocaleDateString()}
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			)}

			{status === "not-found" && (
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-xl font-semibold">
							Start New Visit
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Input
							type="text"
							placeholder="Enter Driver Name"
							value={driverName}
							onChange={(e) => setDriverName(e.target.value)}
						/>
						<Input
							type="text"
							placeholder="Enter Notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
						<Button
							onClick={handleStartVisit}
							disabled={startVisitLoading || !driverName.trim()}
							className="w-full"
						>
							{startVisitLoading ? "Starting driver visit..." : "Start Visit"}
						</Button>
					</CardContent>
				</Card>
			)}

			{status === "error" && (
				<div className="text-center">
					<h1 className="text-xl font-bold text-red-600 mb-4">
						Failed to load driver visit. Please try again.
					</h1>
					<Button onClick={reload}>Retry</Button>
				</div>
			)}
		</div>
	);
}
