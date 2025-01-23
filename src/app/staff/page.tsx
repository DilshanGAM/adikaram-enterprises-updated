"use client";
import LoadedVisitScreen from "@/components/loadedVisit";
import Loading from "@/components/loading";
import StartVisit from "@/components/startVisit";
import { VisitType } from "@/types/user";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffHomePage() {
	const [state, setState] = useState("visit-loading"); //visit-loading, visit-found, visit-not-found
	const [routes, setRoutes] = useState([]);
	const [routesLoaded, setRoutesLoaded] = useState(false);
    const [visit, setVisit] = useState<VisitType|null>(null);

	const router = useRouter();
	useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
		if(state == "visit-loading"){
			axios
				.get("/api/visit/current", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					console.log(res.data);
					if (res.data.visit) {
						if (res.data.visit.status === "started") {
							setState("visit-found");
                            setVisit(res.data.visit);
						}
					} else {
						setState("visit-not-found");
						console.log("No visit started");
					}
				})
				.catch((err) => {
					console.error(err);
				});
		}

        
	}, []);
	return (
		<div className="w-full h-[calc(100vh-60px)] max-[calc(100vh-60px)] flex items-center justify-center overflow-y-scroll">
			{state === "visit-not-found" && <StartVisit />}
            {state === "visit-loading" && <Loading/>}
            {state === "visit-found" && <LoadedVisitScreen visit={visit}/>}
		</div>
	);
}
