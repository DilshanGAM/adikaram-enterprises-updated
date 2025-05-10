"use client"

import { useState } from "react";

export default function LoadOutPage() {
    const [loading, setLoading] = useState(false);
    const yesterday = new Date().setDate(new Date().getDate() - 1);
    const [fromDate , setFromDate] = useState(yesterday);
    const [toDate , setToDate] = useState(new Date().getTime());
    return (
        <div className="w-full bg-red-900 h-full overflow-y-scroll max-h-full flex items-center justify-center">
            <div className="w-1/2 bg-white rounded-lg shadow-lg p-8">Loadout</div>
        </div>
    );
}