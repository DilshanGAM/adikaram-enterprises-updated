"use client";

import { useState } from "react";

export default function BillPage() {
    const [status, setStatus] = useState("loading");//loading, success, error
    const [data, setData] = useState<any>(null);
    const token = localStorage.getItem("token");
    return (
        <div className="w-full">
            <h1>Bill Page</h1>
        </div>
    );
}