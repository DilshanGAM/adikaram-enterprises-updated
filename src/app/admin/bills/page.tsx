"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { IoIosInformationCircleOutline } from "react-icons/io";
import Loading from "@/components/loading";
import Pager from "@/components/pager";
export default function BillsPage() {
	const [bills, setBills] = useState<any[]>([]);
	const [status, setStatus] = useState("loading");
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        limit: 5,
        totalPages: 0,
      });
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("Unauthorized");
		} else {
			axios
				.get(`/api/invoicing/all?page=${pageInfo.page}&limit=${pageInfo.limit}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					setBills(res.data.bills);
					setStatus("loaded");
					console.log(res.data.bills);
                    setPageInfo((prev) => ({
                        ...prev,
                        totalPages: Math.ceil(res.data.pageInfo.total / Number(res.data.pageInfo.limit)),
                      }));
				})
				.catch((err:any) => {
					console.error("Error fetching bills:", err);
					toast.error("Failed to load bills.");
					setStatus("error");
				});
		}
	}, [status]);
	return <div className="w-full  flex justify-center h-full">
        {status === "loading" && <Loading />}
      {status === "error" && <p className="text-red-500">Failed to load bills. Please try again later.</p>}
      
      {status === "loaded" && (
        <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Outstanding</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((billData, index) => {
              const { bill, totalPaid, value } = billData;
              let progress = Math.min((totalPaid / value) * 100, 100);
              if(isNaN(progress)) {
                progress = 0;
              }


              return (
                <TableRow key={index}>
                  <TableCell><a href={"/bill?billId="+bill.id} target="_blank" ><div className="flex items-center">{bill.id}<IoIosInformationCircleOutline /></div></a></TableCell>
                    <TableCell>{bill.shop_name}</TableCell>
                  <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-end w-16">{value.toFixed(2)}</TableCell>
                  <TableCell className="text-end w-24">{totalPaid.toFixed(2)}</TableCell>
                    <TableCell className="text-end w-16">{(value - totalPaid).toFixed(2)}</TableCell>
                 
                  <TableCell colSpan={5}>
                    <Progress value={progress} className="mt-2" />
                    <p className="text-sm text-gray-500">{progress.toFixed(2)}% Paid</p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pager pageInfo={pageInfo} setPageInfo={setPageInfo} reset={()=>setStatus("loading")} />
        </div>
      )}
    </div>;
}
