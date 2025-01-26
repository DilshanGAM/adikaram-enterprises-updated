"use client";
import { ShopRouteType, ShopType } from "@/types/user";
import OopsPage from "./OopsPage";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function StaffShopCard({shop}: {shop: ShopRouteType}){
    const [shopLoadStatus, setShopLoadStatus] = useState("loading");//loading, loaded, error
    const [shopData, setShopData] = useState<ShopType|null>(null);
    useEffect(() => {
        if(shopLoadStatus === "loading"){
            axios.get(`/api/shop/byId?shop=${shop.shop_name}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }).then((res) => {
                setShopData(res.data.shop);
                setShopLoadStatus("loaded");
            }).catch((err) => {
                console.error(err);
                setShopLoadStatus("error");
            });
        }
    });
    return(
        <Link href={"/staff/billUI?shopName="+shop.shop_name} className="w-[200px]  flex items-center justify-center ">
            {shopLoadStatus === "loading" && <p>Loading...</p>}
            {shopLoadStatus === "error" && <OopsPage message="Failed to load shop"/>}
            {shopLoadStatus === "loaded" && (
                <div className="w-full bg-white rounded-lg p-4 shadow-md">
                    <h1 className="text-lg font-semibold">{shopData?.name}</h1>
                    <p>{shopData?.address}</p>
                    <p>{shopData?.phone}</p>
                </div>
            )}
        </Link>
    )
}