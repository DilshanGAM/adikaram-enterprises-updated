"use client"

import ReturnPickerTool from "@/components/returnPickerTool";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReturnsUIPage() {

    const searchParams = useSearchParams();
    const shopName = searchParams.get("shopName") || -99;
    if (shopName == -99) {
        return <div>Shop not found</div>
    }



    return (
        <div className="w-full flex flex-col items-center h-screen">
            <ReturnPickerTool/>
            <h1 className="text-3xl font-semibold text-pepsiBlue">Returns</h1>

        </div>
    );
}

export default function RouteNameWrapper() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ReturnsUIPage />
      </Suspense>
    );
  }