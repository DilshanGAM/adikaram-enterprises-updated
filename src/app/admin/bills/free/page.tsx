"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Loading from "@/components/loading";
import Pager from "@/components/pager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { IoIosInformationCircleOutline } from "react-icons/io";

export default function FreeBillsPage() {
	const [freeItems, setFreeItems] = useState<any[]>([]);
	const [status, setStatus] = useState("loading");
	const [pageInfo, setPageInfo] = useState({
		page: 1,
		limit: 10,
		totalPages: 0,
	});

	// Get the default start date (30 days before today)
	const defaultStartDate = new Date();
	defaultStartDate.setDate(defaultStartDate.getDate() - 30);

	const [startDate, setStartDate] = useState(
		format(defaultStartDate, "yyyy-MM-dd")
	);
	const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

	const fetchFreeItems = () => {
		setStatus("loading");
		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("Unauthorized");
			return;
		}

		axios
			.get(
				`/api/invoicing/free?page=${pageInfo.page}&limit=${pageInfo.limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			.then((res) => {
				setFreeItems(res.data.freeItems);
				setStatus("loaded");
				setPageInfo((prev) => ({
					...prev,
					totalPages: Math.ceil(
						res.data.pageInfo.total / Number(res.data.pageInfo.limit)
					),
				}));
			})
			.catch((err: any) => {
				console.error("Error fetching free items:", err);
				toast.error("Failed to load free items.");
				setStatus("error");
			});
	};

	useEffect(() => {
		fetchFreeItems();
	}, [pageInfo.page]);

	return (
		<div className="w-full flex flex-col p-4">
			{/* Date Filter Section */}
			<div className="flex items-center space-x-4 mb-4">
				<Input
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="w-48"
				/>
				<Input
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="w-48"
				/>
				<Button onClick={fetchFreeItems}>Load</Button>
			</div>

			{/* Loading State */}
			{status === "loading" && <Loading />}
			{status === "error" && (
				<p className="text-red-500">
					Failed to load free items. Please try again later.
				</p>
			)}

			{/* Table Display */}
			{status === "loaded" && (
				<div className="w-full">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item ID</TableHead>
								<TableHead>Product Key</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Invoice ID</TableHead>
								<TableHead>Shop Name</TableHead>
								<TableHead>Invoice Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{freeItems.length > 0 ? (
								freeItems.map((freeItem, index) => (
									<TableRow key={index}>
										<TableCell>{freeItem.id}</TableCell>
										<TableCell>{freeItem.product_key}</TableCell>
										<TableCell>
											{freeItem.loose + freeItem.packs * freeItem.uom}
										</TableCell>
										<TableCell>
											<a
												href={"/bill?billId=" + freeItem.invoice_id}
												target="_blank"
											>
												<div className="flex items-center">
													{freeItem.invoice_id}
													<IoIosInformationCircleOutline />
												</div>
											</a>
										</TableCell>
										<TableCell>{freeItem.invoice.shop_name}</TableCell>
										<TableCell>
											{format(new Date(freeItem.invoice.date), "yyyy-MM-dd")}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center">
										No free items found for the selected date range.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination */}
					<Pager pageInfo={pageInfo} setPageInfo={setPageInfo} />
				</div>
			)}
		</div>
	);
}
