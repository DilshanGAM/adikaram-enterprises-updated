"use client";

import { useEffect, useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { RouteType } from "@/types/user";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function StartVisit() {
    const router = useRouter()
	const [time, setTime] = useState<string>("");
	const [routes, setRoutes] = useState<RouteType[]>([]);
	const [selectedRoute, setSelectedRoute] = useState("");
	const [routesLoaded, setRoutesLoaded] = useState<boolean>(false);



	// Fetch routes (example routes)
	useEffect(() => {
        const interval = setInterval(() => {
			const now = new Date();
			const formattedTime = now.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			setTime(formattedTime);
		}, 1000);

		
        const token = localStorage.getItem("token");
		if (!routesLoaded) {
			//get routes
			axios
				.get("/api/route", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
                    setRoutes(res.data);
					setRoutesLoaded(true);
                    //refresh page
                    router.push("/staff");
				})
				.catch((err) => {
					console.error(err);
				});
		}
        return () => clearInterval(interval);
	}, [routesLoaded]);

	const handleStartVisit = () => {
		if (!selectedRoute) {
            toast.error("Please select a route to start the visit");
			return;
		}
        //token
        const token = localStorage.getItem("token");
        axios.post("/api/visit", {
            routeName: selectedRoute,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            toast.success("Visit started successfully");
        }).catch((err) => {
            toast.error(err.response?.data?.message || "Failed to start visit");
        });
	};

	return (
		<div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-6">
			{/* Clock */}
			<div className="text-pepsiBlue text-6xl font-bold">{time}</div>

			{/* Route Dropdown */}
			<div className="w-64">
				<Select onValueChange={(value) => setSelectedRoute(value)}>
					<SelectTrigger>
						<SelectValue placeholder="Select a route" />
					</SelectTrigger>
					<SelectContent>
						{routes.map((route) => (
							<SelectItem key={route.name} value={route.name}>
								{route.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Start Visit Button */}
			<Button onClick={handleStartVisit} className="w-64">
				Start Visit
			</Button>
		</div>
	);
}
