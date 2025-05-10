"use client";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Helper function to format date as YYYY-MM-DD
function formatDateToInputValue(date: Date) {
	return date.toISOString().split("T")[0];
}

export default function LoadOutPage() {
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	const [fromDate, setFromDate] = useState(formatDateToInputValue(yesterday));
	const [toDate, setToDate] = useState(formatDateToInputValue(today));
	const [status, setStatus] = useState("loading"); //loaded, loading, error
	const [loadOut, setLoadOut] = useState<
		Array<{
			product: any;
			batches: Array<{
				batch: any;
				quantity: number;
			}>;
			quantity: number;
			nonBatchQuantity: number;
		}>
	>([]);
	const [modalOpened, setModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<{
		product: any;
		batches: Array<{
			batch: any;
			quantity: number;
		}>;
		quantity: number;
		nonBatchQuantity: number;
	} | null>(null);

	useEffect(() => {
		if (status === "loading") {
			axios
				.get(
					"/api/invoicing/loadout?fromDate=" + fromDate + "&toDate=" + toDate
				)
				.then((res) => {
					console.log(res.data);
					setLoadOut(res.data);
					setStatus("loaded");
				})
				.catch((err) => {
					console.log(err);
					setStatus("error");
				});
		}
	}, [status]);

	return (
		<div className="w-full h-full overflow-y-scroll max-h-full flex flex-col  items-center">
			<div className="w-full h-[200px] flex flex-col items-center justify-center p-2 ">
				<h1 className="text-2xl text-black font-bold">Load Out</h1>
				<div className="w-full h-[100px] bg-white shadow-lg rounded-lg p-4 flex justify-center items-center">
					<div className="flex items-center justify-center">
						<h1 className="text-lg text-black font-bold">From</h1>
						<Input
							className="w-[300px] m-2"
							placeholder="From Date"
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
						/>
					</div>

					<div className="flex items-center justify-center">
						<h1 className="text-lg text-black font-bold">To</h1>
						<Input
							className="w-[300px]  m-2"
							placeholder="To Date"
							type="date"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
						/>
					</div>
					<Button className="m-2" onClick={() => setStatus("loading")}>
						Load
					</Button>
				</div>
			</div>
			<div className="w-full">
				{status === "loading" && <Loading />}
				{status === "loaded" && (
					<div className="w-full flex flex-col items-center">
						{loadOut.map((item, index) => {
							return (
								<div
									onClick={() => {
										setSelectedItem(item);
										setModalOpen(true);
									}}
									key={index}
									className="w-[1000px] h-[50px] px-8 rounded-lg hover:bg-white cursor-pointer flex flex-row items-center"
								>
									<h1 className="text-lg text-black w-[150px] ">
										({item.product.key})
									</h1>
									<h1 className="text-lg text-black w-[300px] font-bold">
										{item.product.name}
									</h1>
									<h1 className="text-lg text-black w-[150px] font-bold ">
										{Math.floor(item.quantity / item.product.uom)} Packs |
									</h1>
									<h1 className="text-lg text-black w-[150px] font-bold">
										{item.quantity % item.product.uom} Loose |
									</h1>
									<h1 className="text-lg text-black w-[100px] text-end font-bold">
										({item.quantity})
									</h1>
								</div>
							);
						})}
					</div>
				)}
				{status === "error" && (
					<div className="w-full h-full flex flex-col items-center justify-center">
						<h1 className="text-2xl text-red-500 font-bold">
							Error Loading Data
						</h1>
						<h1 className="text-lg text-red-500 font-bold">
							Please try again later
						</h1>
					</div>
				)}
			</div>
			{selectedItem && (
				<Dialog open={modalOpened} onOpenChange={setModalOpen}>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>
								{selectedItem.product.name} loadout details
							</DialogTitle>
						</DialogHeader>
						<div className="w-full flex flex-col items-center">
							<h1 className="text-lg text-black w-full  ">
								Product key : ({selectedItem.product.key})
							</h1>
                            <br />
							<h1 className="text-lg text-black w-full ">
								Total Quantity : &nbsp;
								<span className="font-bold">
									{selectedItem.quantity} &nbsp; (
									{Math.floor(selectedItem.quantity / selectedItem.product.uom)}{" "}
									Packs | {selectedItem.quantity % selectedItem.product.uom}{" "}
									Loose)
								</span>
							</h1>
                            <br />
                            <h1 className="text-lg text-black w-full ">
								Batchless Quantity : &nbsp;
								<span className="font-bold">
									{selectedItem.nonBatchQuantity} &nbsp; (
									{Math.floor(selectedItem.nonBatchQuantity / selectedItem.product.uom)}{" "}
									Packs | {selectedItem.nonBatchQuantity % selectedItem.product.uom}{" "}
									Loose)
								</span>
							</h1>
                            <br />
							<h1 className="text-lg text-black w-full text-start font-bold">
								Batches : &nbsp;
								{selectedItem.batches.length === 0 && (
									<span className="text-lg text-black w-full text-start font-light">
										No batches found
									</span>
								)}
							</h1>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>EXP</TableHead>
                                        <TableHead>MFD</TableHead>
                                        <TableHead>Labelled Price</TableHead>
                                        <TableHead>Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedItem.batches.map((batch, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {batch.batch.batch_id}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        batch.batch.exp
                                                    ).toLocaleDateString("en-GB", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        batch.batch.mfd
                                                    ).toLocaleDateString("en-GB", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {batch.batch.labeled_price.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {batch.quantity} &nbsp; (
                                                    {Math.floor(
                                                        batch.quantity /
                                                            selectedItem
                                                                .product.uom
                                                    )}{" "}
                                                    Packs |{" "}
                                                    {batch.quantity %
                                                        selectedItem.product
                                                            .uom}{" "}
                                                    Loose)
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setModalOpen(false);
									setSelectedItem(null);
								}}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
