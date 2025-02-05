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
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import toast from "react-hot-toast";
import {
	Table,
	TableBody,
	TableCaption,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import ItemRow from "./returnBillUIItemRow";
import FreeItemRow from "./returnBillUIFreeItemRow";
import { ReturnBillType } from "@/types/user";
import BillNotFoundReturnItemAdder from "./billNotFoundReturnItemAdder";
import { FaPlus } from "react-icons/fa";

export default function ReturnPickerTool({ returnBill, setReturnBill , recalculate }:{returnBill:ReturnBillType, setReturnBill:React.Dispatch<React.SetStateAction<ReturnBillType>>,recalculate:any}) {
	const [pickerOpened, setPickerOpened] = useState(false);
	const [openBillNotFound, setOpenBillNotFound] = useState(false);
	const [status, setStatus] = useState("idle"); //bill-found, bill-not-found, loading
	const [billId, setBillId] = useState(0);
	const [invoice, setInvoice] = useState<any>(null);
	const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
	const [freeItems, setFreeItems] = useState<any[]>([]);

    function updateReturnBill(){

        const bill:ReturnBillType = {...returnBill}
        //loop through invoice items and add to return bill items
        /**
         * export interface ReturnBillItemType{
             id: number;
             return_bill_id: number;
             product_key: string;
             batch_id?: number;
             uom: number;
             packs: number;
             loose: number;
             quantity: number;
             price: number;
             invoice_item_id?: number;
             invoice_free_item_id?: number;
             reason: string;
             return_bill: ReturnBillType;
             product: ProductType;
             batch?: BatchType;
             invoice_item?: InvoiceItemType;
             free_item?: FreeItemType;
             invoice_ref?: InvoiceType;
         }
         */
        for (let i = 0; i<invoiceItems.length; i++){
            if (invoiceItems[i].qty > 0){
                bill.items.push({
                    id: -99,
                    return_bill_id: bill.id,
                    product_key: invoiceItems[i].item.product.key,
                    batch_id: invoiceItems[i].item.batch?invoiceItems[i].item.batch.id:null,
                    quantity: invoiceItems[i].qty,
                    price: invoiceItems[i].price,
                    invoice_item_id: invoiceItems[i].item.id,
                    invoice_free_item_id: undefined,
                    reason: invoiceItems[i].reason,
                })
            }
        }
        //loop through free items and add to return bill items
        for (let i = 0; i<freeItems.length; i++){
            if (freeItems[i].qty > 0){
                bill.items.push({
                    id: -99,
                    return_bill_id: bill.id,
                    product_key: freeItems[i].item.product.key,
                    batch_id: freeItems[i].item.batch?freeItems[i].item.batch.id:null,
                    quantity: freeItems[i].qty,
                    price: freeItems[i].price,
                    invoice_free_item_id: freeItems[i].item.id,
                    reason: freeItems[i].reason,
                })
            }
        }
        setReturnBill(bill);
        setPickerOpened(false);
		recalculate();
        console.log(bill);
    }

	function findInvoice() {
		setStatus("loading");
		const token = localStorage.getItem("token");
		if (!token) {
			return;
		} else {
			axios
				.get(`/api/invoicing/billContent?billId=${billId}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res) => {
					console.log(res.data);
					setInvoice(res.data.invoice);
					setStatus("bill-found");
					const newInvoiceItems = [];
					for (let i = 0; i < res.data.invoice.items.length; i++) {
						let startingPrice = 0;
						if (res.data.invoice.items[i].batch) {
							startingPrice = res.data.invoice.items[i].batch.cost;
						} else {
							startingPrice = res.data.invoice.items[i].product.default_cost;
						}
						newInvoiceItems.push({
							index: i,
							item: res.data.invoice.items[i],
							qty: 0,
							price: res.data.invoice.items[i].price,
							selected: false,
							reason: "",
						});
					}
					setInvoiceItems(newInvoiceItems);

					const newFreeItems = [];
					for (let i = 0; i < res.data.invoice.free_items.length; i++) {
						//check if batch is availble

						let startingPrice = 0;
						if (res.data.invoice.free_items[i].batch) {
							startingPrice = res.data.invoice.free_items[i].batch.cost;
						} else {
							startingPrice =
								res.data.invoice.free_items[i].product.default_cost;
						}
                        const freeItem = {...res.data.invoice.free_items[i]}
                        freeItem.quantity = (freeItem.packs*freeItem.uom)+freeItem.loose
                        freeItem.price = startingPrice
						newFreeItems.push({
							index: i,
							item: freeItem,
							qty: 0,
							price: startingPrice,
							selected: false,
							reason: "",
						});
					}
					setFreeItems(newFreeItems);
				})
				.catch((e) => {
					toast.error("Bill not found");
					setStatus("bill-not-found");
				});
		}
	}

	return (
		<>
			{/* Select Items Button to Open Modal */}
			<button  className="fixed right-2 bottom-2 bg-pepsiBlue p-4 rounded-full text-white" onClick={() => setPickerOpened(true)}>
				<FaPlus size={30} />
			</button>

			{/* ShadCN Modal */}
			<Dialog open={pickerOpened} onOpenChange={setPickerOpened}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Return Item Picker</DialogTitle>
					</DialogHeader>

					{/* Modal Content */}
					<div className="p-4 text-gray-700">
						{/* Bill ID Input */}
						<Label>Enter Bill ID</Label>
						<Input
							type="number"
							value={billId}
							onChange={(e) => setBillId(parseInt(e.target.value) || 0)}
						/>
						<div className="flex justify-center space-x-2 my-2">
							<Button onClick={findInvoice}>Load Bill</Button>
							<Button onClick={() => {
                                setPickerOpened(false)
                                setOpenBillNotFound(true)}
                                }>
								Manual override
							</Button>
						</div>
						<Separator />
						{status == "bill-found" && (
							<div className="flex flex-col justify-between items-center">
								<p className="text-lg font-semibold w-full text-center">
									Items
								</p>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead></TableHead>
											<TableHead>Item</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Return Quantity</TableHead>
											<TableHead>Return Price</TableHead>
											<TableHead>Return Reason</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{invoiceItems.map((item: any, index: any) => (
											<ItemRow
												invoiceItems={invoiceItems}
												key={item.index}
												setInvoiceItems={setInvoiceItems}
												index={item.index}
												item={item}
											/>
										))}
									</TableBody>
								</Table>
							</div>
						)}
						<Separator />
                        {
                            status == "bill-found" && (
                                <div className="flex flex-col justify-between items-center">
                                    <p className="text-lg font-semibold w-full text-center">
                                        Free Items
                                    </p>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead></TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Return Quantity</TableHead>
                                                <TableHead>Return Price</TableHead>
                                                <TableHead>Return Reason</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {freeItems.map((item: any, index: any) => (
                                               <FreeItemRow 
                                                    invoiceItems={freeItems}
                                                    key={item.index}
                                                    setInvoiceItems={setFreeItems}
                                                    index={item.index}
                                                    item={item}
                                                  />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )
                        }

						{status == "loading" && (
							<p className="w-full text-center my-2">Searching...</p>
						)}
						{status == "bill-not-found" && (
							<p className="w-full text-center my-2">Bill not found</p>
						)}
						{status == "idle" && (
							<p className="w-full text-center my-2">
								Enter bill ID to load items
							</p>
						)}
					</div>

					{/* Footer Buttons */}
					<DialogFooter>
						<Button variant="secondary" onClick={() => setPickerOpened(false)}>
							Cancel
						</Button>
						<Button onClick={updateReturnBill}>Confirm</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<BillNotFoundReturnItemAdder recalculate={recalculate} modalOpen={openBillNotFound} setModalOpen={setOpenBillNotFound} returnBill={returnBill} setReturnBill={setReturnBill} />
		</>
	);
}
