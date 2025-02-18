"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Pager from "@/components/pager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/loading";

export default function AllVisitsPage() {
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [driverVisits, setDriverVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  function getVisitPaymentTotal(visit: any) {
    return visit.payments.reduce((total: number, payment: any) => total + payment.amount, 0);
  }

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`/api/driverVisits/all?page=${pageInfo.page}&limit=${pageInfo.limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDriverVisits(res.data.driverVisits);
        setPageInfo((prev) => ({
          ...prev,
          totalPages: Math.ceil(res.data.pageInfo.total / Number(res.data.pageInfo.limit)),
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [pageInfo.page]);

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Driver Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Total Collection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverVisits.length > 0 ? (
                  driverVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.id}</TableCell>
                      <TableCell>{visit.driver_name}</TableCell>
                      <TableCell>{new Date(visit.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{visit.status}</TableCell>
                      <TableCell>{visit.notes || "No Notes"}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {getVisitPaymentTotal(visit).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No visits found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pager pageInfo={pageInfo} setPageInfo={setPageInfo} />
    </div>
  );
}
