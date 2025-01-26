"use client";

import { useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BatchType, InvoiceType, ProductType } from "@/types/user";
import { ProductFinder } from "./productFinder";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductAddingModal(props: {
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
	invoice: InvoiceType;
}) {
	const [product, setProduct] = useState<ProductType | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [batchList, setBatchList] = useState<BatchType[]>([]);
	const [batchListLoadingStatus, setBatchListLoadingStatus] =
		useState("loading"); // loading, loaded, error
	const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null);
	const [packs, setPacks] = useState(0);
	const [loose, setLoose] = useState(0);
	const [uom, setUom] = useState(0);
	const [price, setPrice] = useState(0);

	async function loadBatches(key:string) {
		const token = localStorage.getItem("token");
		setBatchListLoadingStatus("loading");
		try {
			const res = await axios.get(
				"/api/batches/findAvailable?productKey=" + key,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log(res.data);
			setBatchList(res.data.batches);
			setBatchListLoadingStatus("loaded");
		} catch (err: any) {
			console.log(err);
			setBatchListLoadingStatus("error");
		}
	}

	const handleSave = () => {
		if (selectedBatch) {
			// Check if quantity is available in the batch
			const batchQty = selectedBatch.remaining;
			const quantity = packs * uom + loose;
			if (quantity > batchQty) {
				toast.error("Quantity not available in batch");
				return;
			}
			// Check if product price is higher than batch price
			if (selectedBatch.cost < price) {
				toast.error("Price is lower than batch cost");
				return;
			}
			// Add to invoice
		} else {
			const productQty = product?.stock || 0;
			const quantity = packs * uom + loose;
			if (quantity > productQty) {
				toast.error("Quantity not available in stock");
				return;
			}
			// Check if product price is higher than product cost
			if (product?.default_cost && product.default_cost < price) {
				toast.error("Price is lower than product cost");
				return;
			}
			// Add to invoice
		}
	};

	return (
		<>
			<ProductFinder
				
				openView={async (product:ProductType) => {
                    setProduct(product);
                    setUom(product.uom);
					loadBatches(product.key);
					console.log(buttonRef?.current?.click());
				}}
			/>
			<Dialog>
				<DialogTrigger asChild>
					<Button className="hidden" ref={buttonRef}>
						Add Product
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Product</DialogTitle>
					</DialogHeader>
					<div>
						{batchListLoadingStatus === "loading" ? (
							"Loading batches"
						) : batchListLoadingStatus === "error" ? (
							"Error loading batches"
						) : batchListLoadingStatus === "loaded" ? (
							<>
								<Label>Available Batches</Label>
								<Select
									value={selectedBatch?.batch_id?.toString() || ""}
									onValueChange={(value) => {
										const batch = batchList.find(
											(b) => b.batch_id.toString() === value
										);
										setSelectedBatch(batch || null);
										if (batch) {
											setUom(batch.uom);
										} else {
											setUom(product?.uom || 0);
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Batch" />
									</SelectTrigger>
									<SelectContent>
										{batchList.map((batch) => (
											<SelectItem
												key={batch.batch_id}
												value={batch.batch_id.toString()}
											>
												Batch ID: {batch.batch_id} - Remaining:{" "}
												{batch.remaining}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Label>Packs</Label>
								<Input
									type="number"
									value={packs}
									onChange={(e) => setPacks(parseInt(e.target.value))}
								/>
								<Label>Loose</Label>
								<Input
									type="number"
									value={loose}
									onChange={(e) => setLoose(parseInt(e.target.value))}
								/>
								<Label>Price</Label>
								<Input
									type="number"
									value={price}
									onChange={(e) => setPrice(parseFloat(e.target.value))}
								/>
							</>
						) : null}
					</div>
					<DialogFooter>
						<Button variant="secondary">Cancel</Button>
						<Button onClick={handleSave}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
