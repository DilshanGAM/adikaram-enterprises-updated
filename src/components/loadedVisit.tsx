"use client";
import { ShopRouteType, VisitType } from "@/types/user";
import { useEffect, useState } from "react";
import OopsPage from "./OopsPage";
import axios from "axios";
import StaffShopCard from "./staffShopCard";
import Loading from "./loading";

export default function LoadedVisitScreen({
	visit,
}: {
	visit: VisitType | null;
}) {
	const [shopsLoadStatus, setShopsLoadStatus] = useState("loading"); //loading, loaded, error
	const [shops, setShops] = useState<ShopRouteType[]>([]);
	useEffect(() => {
		if (visit) {
			const token = localStorage.getItem("token");
			if (!token) return;
			if (shopsLoadStatus === "loading") {
				axios
					.get("/api/route/shops", {
						headers: {
							Authorization: `Bearer ${token}`,
						},
						params: {
							routeName: visit.route_name,
						},
					})
					.then((res) => {
						setShops(res.data.shops);
						setShopsLoadStatus("loaded");
					})
					.catch((err) => {
						console.error(err);
						setShopsLoadStatus("error");
					});
			}
		}
	});

	return (
		<div className="w-full h-full max-h-full flex items-center justify-center overflow-y-scroll">
			{shopsLoadStatus === "loading" && <Loading />}
			{shopsLoadStatus === "error" && (
				<OopsPage message="Failed to load shops" />
			)}
			{shopsLoadStatus === "loaded" && (
				<div className="w-full flex flex-col items-center space-y-4">
					{shops.map((shop, index) => (
						<StaffShopCard key={index} shop={shop} />
					))}
				</div>
			)}

		</div>
	);
}
