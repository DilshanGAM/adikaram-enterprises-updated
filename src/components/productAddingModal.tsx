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
import { BatchType, InvoiceItemType, InvoiceType, ProductType } from "@/types/user";
import { ProductFinder } from "./productFinder";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProductAddingModal(props: {
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
	invoice: InvoiceType;
}) {
	const [productKey, setProductKey] = useState("");
    const [product, setProduct] = useState<ProductType | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [batchList, setBatchList] = useState<BatchType[]>([]);
	const [batchListLoadingStatus, setBatchListLoadingStatus] = useState("loading");//loading, loaded, error
    const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null);
    const [packs, setPacks] = useState(0);
    const [loose, setLoose] = useState(0);
    const [uom, setUom] = useState(0);
    const [price, setPrice] = useState(0);

    function loadBatches(){
        const token = localStorage.getItem("token");
        setBatchListLoadingStatus("loading");
        axios
            .get("/api/batches/findAvailable?productKey=" + productKey, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log(res.data);
                setBatchList(res.data.batches);
                setBatchListLoadingStatus("loaded");
            })
            .catch((err) => {
                console.log(err);
                setBatchListLoadingStatus("error");
            });
    }

	const handleSave = () => {
        if(selectedBatch){
            //check if quantity availabale in batch
            const batchQty = selectedBatch.remaining;
            const quantity = packs * uom + loose;
            if(quantity > batchQty){toast.error("Quantity not available in batch");return;}
            //check if product price is higher than batch price
            if(selectedBatch.cost<price){toast.error("Price is lower than batch cost");return;}
            //add to invoice
        }else{
            const productQty = product?.stock || 0;
            const quantity = packs * uom + loose;
            if(quantity > productQty){toast.error("Quantity not available in stock");return;}
            //check if product price is higher than product cost
            if(product?.default_cost && product.default_cost<price){toast.error("Price is lower than product cost");return;}
            //add to invoice
        }
    };

	return (
		<>
			<ProductFinder
				val={[productKey]}
				onChange={(key:string, product:ProductType) => {setProductKey(key); setProduct(product);setUom(product.uom)}}
				openView={() => {
					//click the button ref button
					console.log(buttonRef?.current?.click());
                    loadBatches();
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
                        {
                            batchListLoadingStatus === "loading" ? "Loading batches" :
                            batchListLoadingStatus === "error" ? "Error loading batches" :
                            batchListLoadingStatus === "loaded" ? 
                            <>
                                <Label>Available Batches</Label>
                                <select
                                    value={selectedBatch?.batch_id}
                                    onChange={(e) => {
                                        const batch = batchList.find((b) => b.batch_id === parseInt(e.target.value));
                                        setSelectedBatch(batch || null);
                                        if(batch){
                                            setUom(batch.uom);
                                        }else{
                                            setUom(product?.uom || 0);
                                        }
                                    }}
                                >
                                    <option value={-1}>Select Batch</option>
                                    {
                                        batchList.map((batch) => (
                                            <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_id+ " Remaining :"+batch.remaining}</option>
                                        ))
                                    }
                                    
                                </select>
                            </> : null
                        }
                        <Label>Packs</Label>
                        <input type="number" value={packs} onChange={(e) => setPacks(parseInt(e.target.value))} />
                        <Label>Loose</Label>
                        <input type="number" value={loose} onChange={(e) => setLoose(parseInt(e.target.value))} />
                        <Label>Price</Label>
                        <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value))} />
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
