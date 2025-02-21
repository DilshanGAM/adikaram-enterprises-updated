"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LogoutModal({ isOpen }: { isOpen: boolean }) {
	const [modalOpen, setModalOpen] = useState(false);
	const router = useRouter();

	const handleLogout = () => {
		// Perform logout logic (clear token, redirect, etc.)
		localStorage.removeItem("token");
		toast.success("Logged out successfully!");
		setModalOpen(false);

		// Redirect user to login page
		setTimeout(() => {
			router.push("/");
		}, 1500);
	};

	return (
        <>
		<button className="w-full  flex flex-row items-center justify-start hover:bg-gray-600 text-gray-300  gap-4 px-4 py-2 cursor-pointer"
        onClick={() => setModalOpen(true)}>
			
				<div className="text-xl">{<FaSignOutAlt />}</div>
				{isOpen && <span className="text-sm">{"Logout"}</span>}
        </button>
			{/* Logout Confirmation Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Logout</DialogTitle>
					</DialogHeader>
					<p className="text-gray-600">Are you sure you want to log out?</p>
					<DialogFooter className="flex justify-end gap-2">
						<Button variant="secondary" onClick={() => setModalOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleLogout}>
							Logout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
