"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get("/api/summary")
      .then((res) => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading summary:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin" /></div>;

  return (
    <div className="p-6 max-h-screen max-w-[calc(100vw-40px)] overflow-y-scroll">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Separator className="mb-4" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Invoices" value={summary.totalInvoices} />
        <SummaryCard title="Total Payments" value={`${summary.totalPayments}`} />
        <SummaryCard title="Pending Invoices" value={summary.pendingInvoices} />
        <SummaryCard title="Return Bills" value={summary.returnBills} />
      </div>

      <Separator className="my-6" />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.monthlySales}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_sum.tax" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.topProducts}>
                <XAxis dataKey="product_key" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_sum.quantity" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: any }) {
  return (
    <Card className="p-4 text-center">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-2xl font-bold">{value}</h2>
      </CardContent>
    </Card>
  );
}
