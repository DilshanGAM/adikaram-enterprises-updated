"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";

export default function StaffShopAddingForm({
	isAddEditModalOpen,
	setIsAddEditModalOpen,
	previousShopName,
}: {
	isAddEditModalOpen: boolean;
	setIsAddEditModalOpen: (open: boolean) => void;
	previousShopName: string;
}) {
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		phone: "",
		whatsapp: "",
		status: "active",
		owner: "",
		max_credit: "",
		longitude: "",
		latitude: "",
	});
    const [loading , setLoading] = useState(false);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};
	const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            toast.success("Please login again");
            return;
        }
        try {
            const response = await axios.post(
                "/api/shop/addOnField",
                {
                    shopData : formData,
                    previousShop: previousShopName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(response.data.message);
            setIsAddEditModalOpen(false);
            setFormData({
                name: "",
                address: "",
                phone: "",
                whatsapp: "",
                status: "active",
                owner: "",
                max_credit: "",
                longitude: "",
                latitude: "",
            });
            setLoading(false);
            window.location.reload();
        } catch (error) {
            setLoading(false);
            if (axios.isAxiosError(error)) {
				alert(error.response?.data.err.toString() || "An error occurred");
                alert(error.response?.data.message || "An error occurred");
            } else {
                toast.error("An error occurred");
            }
        }
    };
	return (
		<Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Shop</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Input
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="Shop Name"
						required
					/>
					<Input
						name="address"
						value={formData.address}
						onChange={handleChange}
						placeholder="Address"
						required
					/>
					<Input
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						placeholder="Phone"
						required
					/>
					<Input
						name="whatsapp"
						value={formData.whatsapp}
						onChange={handleChange}
						placeholder="WhatsApp"
					/>
					<Input
						name="owner"
						value={formData.owner}
						onChange={handleChange}
						placeholder="Owner"
						required
					/>
					<Input
						name="max_credit"
						type="number"
						value={formData.max_credit}
						onChange={handleChange}
						placeholder="Max Credit"
						required
					/>
					<Input
						name="longitude"
						type="number"
						value={formData.longitude}
						onChange={handleChange}
						placeholder="Longitude"
					/>
					<Input
						name="latitude"
						type="number"
						value={formData.latitude}
						onChange={handleChange}
						placeholder="Latitude"
					/>
				</div>
				<DialogFooter>
					<Button
						onClick={() => setIsAddEditModalOpen(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
