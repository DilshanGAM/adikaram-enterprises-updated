"use client";

import { ShopRouteType, ShopType } from "@/types/user";
import OopsPage from "./OopsPage";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, User, ShoppingBag } from "lucide-react";

export default function StaffShopCard({ shop }: { shop: ShopRouteType }) {
    const [shopLoadStatus, setShopLoadStatus] = useState("loading"); // loading, loaded, error
    const [shopData, setShopData] = useState<ShopType | null>(null);

    useEffect(() => {
        if (shopLoadStatus === "loading") {
            axios
                .get(`/api/shop/byId?shop=${shop.shop_name}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setShopData(res.data.shop);
                    setShopLoadStatus("loaded");
                })
                .catch((err) => {
                    console.error(err);
                    setShopLoadStatus("error");
                });
        }
    }, []);

    return (
        <Card className="w-[300px] bg-white shadow-lg rounded-lg">
            {shopLoadStatus === "loading" && <p className="text-center py-4">Loading...</p>}
            {shopLoadStatus === "error" && <OopsPage message="Failed to load shop" />}
            {shopLoadStatus === "loaded" && shopData && (
                <>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-pepsiBlue flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                            {shopData.name}
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-sm">{shopData.status.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">Address:</span> {shopData.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">Phone:</span> {shopData.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                            <User className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="font-medium">Owner:</span> {shopData.owner}
                        </div>

                        <Separator className="my-2" />

                        {/* Buttons Section */}
                        <div className="flex justify-between gap-2">
                            {/* Billing Button (Link) */}
                            <Link href={`/staff/billUI?shopName=${shop.shop_name}`}>
                                <Button variant="default" className="w-full">
                                    Billing
                                </Button>
                            </Link>

                            {/* Returns Button */}
                            <Button variant="outline" className="w-full">
                                Returns
                            </Button>

                            {/* Add Shop Button */}
                            <Button variant="outline" className="w-full">
                                Add Shop
                            </Button>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
