"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { IoIosInformationCircleOutline } from "react-icons/io";
import BillPayModalStaff from "@/components/billPayModalStaff";

function PaymentsPage() {
  const searchParams = useSearchParams();
  const shopName = searchParams.get("shopName") || "";
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
  const [status, setStatus] = useState("loading");
  const [activeBill, setActiveBill] = useState<any>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized");
    } else {
      axios
        .get(`/api/invoicing/unpaidBills?shopName=${shopName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUnpaidBills(res.data.bills);
          setStatus("loaded");
          console.log(res.data.bills);
        })
        .catch((err) => {
          console.error("Error fetching unpaid bills:", err);
          toast.error("Failed to load unpaid bills.");
          setStatus("error");
        });
    }
  }, [shopName , status]);
  function handlePayModalOpen(bill: any) {
    setActiveBill(bill);
    setPayModalOpen(true);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Payments for Shop: {shopName}</h1>
      
      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p className="text-red-500">Failed to load bills. Please try again later.</p>}
      
      {status === "loaded" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidBills.map((billData, index) => {
              const { bill, totalPaid, value } = billData;
              let progress = Math.min((totalPaid / value) * 100, 100);
              if(isNaN(progress)) {
                progress = 0;
              }


              return (
                <TableRow key={index}>
                  <TableCell><a href={"/bill?billId="+bill.id} target="_blank" ><div className="flex items-center">{bill.id}<IoIosInformationCircleOutline /></div></a></TableCell>
                  <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-end w-16">{value.toFixed(2)}</TableCell>
                  <TableCell className="text-end w-24">{totalPaid.toFixed(2)}</TableCell>
                    <TableCell className="text-end w-16">{(value - totalPaid).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="secondary" onClick={()=>handlePayModalOpen(billData)}>Pay</Button>
                  </TableCell>
                  <TableCell colSpan={5}>
                    <Progress value={progress} className="mt-2" />
                    <p className="text-sm text-gray-500">{progress.toFixed(2)}% Paid</p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      {activeBill&&
      <BillPayModalStaff modalOpen={payModalOpen} setModalOpen={setPayModalOpen} bill={activeBill} shopName={shopName} reloadPage = {()=>setStatus("loading")} />}
      
    </div>
  );
}

export default function RouteNameWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentsPage />
    </Suspense>
  );
}
