"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminShopsPage() {
	const [shops, setShops] = useState([]);
	const [selectedShop, setSelectedShop] = useState<any>(null); // For editing/deleting
	const [isLoading, setIsLoading] = useState(true);
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
	const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
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

	// Fetch shops from the API
	useEffect(() => {
		const fetchShops = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await axios.get("/api/shop", {
					headers: { Authorization: `Bearer ${token}` },
				});
				setShops(res.data.shops);
			} catch (err: any) {
				toast.error(err.response?.data?.message || "Failed to fetch shops");
			} finally {
				setIsLoading(false);
			}
		};

		if (isLoading) fetchShops();
	}, [isLoading]);

	// Handle form input changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle adding or editing a shop
	const handleSave = async () => {
		const token = localStorage.getItem("token");
		try {
			if (selectedShop) {
				// Update shop
				await axios.put(`/api/shop?name=${selectedShop.name}`, formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				toast.success("Shop updated successfully!");
			} else {
				// Add new shop
				await axios.post("/api/shop", formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				toast.success("Shop added successfully!");
			}
			setIsAddEditModalOpen(false);
			setIsLoading(true); // Refresh the shops
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to save shop");
		}
	};

	// Handle deleting a shop
	const handleDelete = async () => {
		const token = localStorage.getItem("token");
		try {
			await axios.delete(`/api/shop?name=${selectedShop.name}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success("Shop deleted successfully!");
			setIsConfirmationOpen(false);
			setIsLoading(true); // Refresh the shops
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to delete shop");
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Shop Management</h1>

			{/* Loading Message */}
			{isLoading ? (
				<div className="text-center text-lg font-medium text-gray-700">
					Loading, please wait...
				</div>
			) : (
				<>
					<div className="flex items-center gap-4 mb-4">
						<Button onClick={() => setIsAddEditModalOpen(true)}>
							Add Shop
						</Button>
					</div>

					{/* Shops Table */}
					<div className="overflow-auto">
						<Table>
							<TableCaption>A list of all shops.</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Owner</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Max Credit</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{shops.length > 0 ? (
									shops.map((shop: any) => (
										<TableRow key={shop.name}>
											<TableCell>{shop.name}</TableCell>
											<TableCell>{shop.address}</TableCell>
											<TableCell>{shop.phone}</TableCell>
											<TableCell>{shop.owner}</TableCell>
											<TableCell>{shop.status}</TableCell>
											<TableCell>{shop.max_credit}</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setSelectedShop(shop);
															setFormData(shop);
															setIsAddEditModalOpen(true);
														}}
													>
														Edit
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => {
															setSelectedShop(shop);
															setIsConfirmationOpen(true);
														}}
													>
														Delete
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="text-center">
											No shops found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</>
			)}

			{/* Add/Edit Modal */}
			<Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedShop ? "Edit Shop" : "Add Shop"}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Input
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Shop Name"
							required
							disabled={!!selectedShop} // Disable name editing for existing shops
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
						<Button onClick={handleSave}>
							{selectedShop ? "Update" : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirmation Modal */}
			<Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
					</DialogHeader>
					<p>
						Are you sure you want to delete the shop "{selectedShop?.name}"?
					</p>
					<DialogFooter>
						<Button
							onClick={() => setIsConfirmationOpen(false)}
							variant="outline"
						>
							Cancel
						</Button>
						<Button onClick={handleDelete} variant="destructive">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
