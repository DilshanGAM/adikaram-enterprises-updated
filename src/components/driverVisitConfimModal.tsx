"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import Loading from "./loading";
import toast from "react-hot-toast";

export default function DriverVisitConfirmModal({
	modalOpen,
	setModalOpen,
	reloader,
	driverVisit,
}: {
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	reloader: () => void;
	driverVisit: any;
}) {
  const [notes, setNotes] = useState<string>(driverVisit.notes);
	const [loading, setLoading] = useState<boolean>(false);
	function getPaymentTotal() {
		let total = 0;
		driverVisit.payments.forEach((payment: any) => {
			total += payment.amount;
		});
		return total;
	}
	function handleFinishVisit() {
    setLoading(true);
		const token = localStorage.getItem("token");
		if (!token) {
			return;
		}
		axios
			.put(
				"/api/driverVisits/",
				{
					notes,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then(() => {
        setLoading(false);
				reloader();
				setModalOpen(false);
			})
			.catch((err) => {
				console.log(err);
        setLoading(false);
        toast.error("Failed to finish visit");
			});
	}
	

	return (
		<Dialog open={modalOpen} onOpenChange={setModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Finish Driver Visit #{driverVisit.id}</DialogTitle>
				</DialogHeader>
				{loading ? (
					<Loading />
				) : (
					<div className="text-gray-600">
						<p>
							<strong>Driver:</strong> {driverVisit.driver_name}
						</p>
						{/* Did you recieve {total} amount of cash?*/}
						<h1 className="text-xl font-bold text-gray-800">
							Did you recieve {getPaymentTotal().toFixed(2)} amount of cash?
						</h1>

						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Enter notes here..."
						/>
					</div>
				)}
				<DialogFooter>
					<Button
						variant="default"
						disabled={loading}
						onClick={() => setModalOpen(false)}
					>
						Back
					</Button>
					<Button
						disabled={loading}
						variant="secondary"
						onClick={handleFinishVisit}
					>
						Finish Visit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
