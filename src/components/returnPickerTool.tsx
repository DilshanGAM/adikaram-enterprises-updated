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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import ItemRow from "./returnBillUIItemRow";

export default function ReturnPickerTool() {
    const [pickerOpened, setPickerOpened] = useState(false);
    const [openBillNotFound, setOpenBillNotFound] = useState(false);
    const [billRelated, setBillRelated] = useState(false);
    const [billId, setBillId] = useState(0);
    const [invoice, setInvoice] = useState<any>(null);
    const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
    const [freeItems, setFreeItems] = useState<any[]>([]);

    function findInvoice(){
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
                })
                .catch((e) => {
                    toast.error("Bill not found");
                });
        }
    }

    return (
        <>
            {/* Select Items Button to Open Modal */}
            <Button variant="outline" onClick={() => setPickerOpened(true)}>
                Select Items
            </Button>

            {/* ShadCN Modal */}
            <Dialog open={pickerOpened} onOpenChange={setPickerOpened}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Return Item Picker</DialogTitle>
                    </DialogHeader>

                    {/* Modal Content */}
                    <div className="p-4 text-gray-700">
                        {/* Bill ID Input */}
                        <Label>Enter Bill ID</Label>
                        <Input type="number" value={billId} onChange={(e) => setBillId(parseInt(e.target.value)||0)} />
                        <div className="flex justify-center space-x-2 my-2">
                            <Button onClick={findInvoice}>Load Bill</Button>
                            <Button onClick={() => setOpenBillNotFound(true)}>Not Found</Button>
                        </div>
                        <Separator />
                        {invoice&&<div className="flex justify-between items-center">
                            <Table>
                                <TableCaption>Items</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead></TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.items.map((item:any, index:any) => (
                                            <ItemRow key={index} index={index}  item={item} />
                                        ))}
                                    </TableBody>

                            </Table>
                        </div>}
                    </div>

                    {/* Footer Buttons */}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setPickerOpened(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setPickerOpened(false)}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={openBillNotFound} onOpenChange={setOpenBillNotFound}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bill not found</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-gray-700">
                        <p>Bill not found for this shop</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setOpenBillNotFound(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

