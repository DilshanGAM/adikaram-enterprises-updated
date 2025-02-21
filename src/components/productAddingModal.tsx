"use client";

import { useState } from "react";
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
import {
	BatchType,
	FreeItemType,
	InvoiceItemType,
	InvoiceType,
	ProductType,
} from "@/types/user";
import { ProductFinder } from "./productFinder";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductAddingModal(props: {
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
	invoice: InvoiceType;
	isFreeIssue: boolean;
    setSummaryResetter : React.Dispatch<React.SetStateAction<boolean>>;
    summaryResetter: boolean;
}) {
	const [product, setProduct] = useState<ProductType | null>(null);
	const [batchList, setBatchList] = useState<BatchType[]>([]);
	const [batchListLoadingStatus, setBatchListLoadingStatus] =
		useState("loading"); // loading, loaded, error
	const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null);
	const [packs, setPacks] = useState(0);
	const [loose, setLoose] = useState(0);
	const [uom, setUom] = useState(0);
	const [price, setPrice] = useState(0);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	async function loadBatches(key: string) {
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
			//currently added quatity of the product in the invoice from the given batch\
			let addedQty = 0
			props.invoice.items?.forEach((item)=>{
				if(item.batch_id === selectedBatch.batch_id){
					addedQty += item.quantity;
				}
			})
			if (quantity+addedQty > batchQty) {
				toast.error("Quantity not available in batch");
				return;
			}
			// Check if product price is higher than batch price

			if (!props.isFreeIssue && selectedBatch.cost > price) {
				toast.error("Price is lower than batch cost");
				return;
			}
			// Add to invoice
		} else {
			const productQty = product?.stock || 0;
			const quantity = packs * uom + loose;
			let addedQty = 0
			props.invoice.items?.forEach((item)=>{
				if(item.product_key === product?.key){
					addedQty += item.quantity;
				}
			})
			if (quantity+addedQty > productQty) {
				toast.error("Quantity not available in stock");
				return;
			}
			// Check if product price is higher than product cost
			if (
				!props.isFreeIssue &&
				product?.default_cost &&
				product.default_cost > price
			) {
				toast.error("Price is lower than product cost");
				return;
			}
			// Add to invoice
		}
		const newInvoice = { ...props.invoice };
		if (!props.isFreeIssue) {
			const item: InvoiceItemType = {
				id: -99,
				invoice_id: -99,
				product_key: product?.key || "",
				batch_id: selectedBatch?.batch_id || -99,
				uom: uom,
				packs: packs,
				loose: loose,
				quantity: packs * uom + loose,
				price: price,
			};
			//copy invoice to const newInvoice

			if (newInvoice.items) {
				newInvoice.items.push(item);
			} else {
				newInvoice.items = [item];
			}
		}else{
            const freeItem:FreeItemType = {
                id: -99,
                invoice_id: -99,
                product_key: product?.key || "",
                batch_id: selectedBatch?.batch_id || -99,
                uom: uom,
                packs: packs,
                loose: loose,
                quantity: packs * uom + loose,
            }
            if(newInvoice.freeItems){
                newInvoice.freeItems.push(freeItem);
            }else{
                newInvoice.freeItems = [freeItem];
            }
        }
		props.setInvoice(newInvoice);
		setProduct(null);
		setSelectedBatch(null);
		setPacks(0);
		setLoose(0);
		//close dialog
		setIsDialogOpen(false);
        props.setSummaryResetter(!props.summaryResetter);
		toast.success("Item added to invoice");
	};

	return (
		<>
			<ProductFinder
				openView={async (product: ProductType) => {
					setProduct(product);
					setUom(product.uom);
					loadBatches(product.key);
					setIsDialogOpen(true);
				}}
			/>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger asChild></DialogTrigger>
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
										<SelectItem value="0">No batch</SelectItem>
										{batchList.map((batch) => (
											<SelectItem
												key={batch.batch_id}
												value={batch.batch_id.toString()}
											>
												<div>
													<p>{batch.batch_id}</p>
													<p>{new Date(batch.exp).toDateString()}</p>
													<p>{new Date(batch.mfd).toDateString()}</p>
													<p>{batch.cost}</p>
													<p>{batch.remaining}</p>
												</div>
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
									type={!props.isFreeIssue?"number":"text"}
                                    disabled={props.isFreeIssue}
									value={!props.isFreeIssue?price:"Free Issue"}
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
