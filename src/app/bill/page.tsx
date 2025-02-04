"use client";

import Loading from "@/components/loading";
import OopsPage from "@/components/OopsPage";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IoPrintSharp } from "react-icons/io5";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

export default function BillPage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [data, setData] = useState<any>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("error");
        } else {
            const billId = searchParams.get("billId") || "";
            axios
                .get(`/api/invoicing/extended?id=${billId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    console.log(res.data);
                    setData(res.data);
                    setStatus("success");
                })
                .catch(() => {
                    setStatus("error");
                });
        }
    }, []);

    if (status === "loading") return <Loading />;
    if (status === "error") return <OopsPage message="Something went wrong" />;

    const { invoice } = data;
    const invoiceTotal = invoice.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const discountTotal = invoice.discount || 0;
    const taxTotal = invoice.tax || 0;
    const netTotal = invoiceTotal - discountTotal + taxTotal;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* ✅ Bill Summary Card */}
            <Card className="shadow-md relative">
                <CardHeader>
                    <CardTitle className="text-xl">Invoice Details </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    <IoPrintSharp  className="absolute right-1 top-1" onClick={()=>{
                        generateInvoicePDF(invoice);
                    }}/>
                        <p><span className="font-semibold">Shop Name:</span> {invoice.shop.name}</p>
                        <p><span className="font-semibold">Shop Owner:</span> {invoice.shop.owner}</p>
                        <p><span className="font-semibold">Visit Route:</span> {invoice.visit.route_name}</p>
                        <p><span className="font-semibold">Visited By:</span> {invoice.visit.visited_by}</p>
                        <p><span className="font-semibold">Invoice Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Status:</span> {invoice.status}</p>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* ✅ Invoice Items Table */}
            <h2 className="text-xl font-semibold text-pepsiBlue">Invoice Items</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoice.items.length > 0 ? (
                        invoice.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.batch?.batch_id || "N/A"}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No invoice items found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Separator />

            {/* ✅ Free Items Table */}
            <h2 className="text-xl font-semibold text-pepsiBlue">Free Items</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoice.free_items.length > 0 ? (
                        invoice.free_items.map((item: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.batch?.batch_id || "N/A"}</TableCell>
                                <TableCell>{item.packs * item.uom + item.loose}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No free items found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Separator />

            {/* ✅ Payments Table */}
            <h2 className="text-xl font-semibold text-pepsiBlue">Payments</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoice.payments.length > 0 ? (
                        invoice.payments.map((payment: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{payment.id}</TableCell>
                                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                <TableCell>{payment.type}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No payments found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Separator />

            {/* ✅ Bill Summary */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">Bill Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <p><span className="font-semibold">Total Amount:</span> ${invoiceTotal.toFixed(2)}</p>
                        <p><span className="font-semibold">Discount:</span> -${discountTotal.toFixed(2)}</p>
                        <p><span className="font-semibold">Tax:</span> +${taxTotal.toFixed(2)}</p>
                        <p className="text-lg font-semibold"><span className="font-bold">Net Total:</span> ${netTotal.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
