"use client";
"use client";

import Loading from "@/components/loading";
import Pager from "@/components/pager";
import VisitCard from "@/components/visitCard";
import { VisitType } from "@/types/user";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VisitsPage() {
	const [status, setStatus] = useState("loading");// "success" | "error" | "loading"
	const [visits, setVisits] = useState<VisitType[]>([]);
	const [pageInfo, setPageInfo] = useState({
		page: 1,
		limit: 2,
		totalPages: 0,
	});

	useEffect(() => {
		if (status === "loading") {
			axios
				.get(
					"/api/visit/all?page=" + pageInfo.page + "&limit=" + pageInfo.limit,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				)
				.then((res) => {
					setVisits(res.data.visits);
					setPageInfo({
						page: res.data.pageInfo.page,
						limit: res.data.pageInfo.limit,
						totalPages: res.data.pageInfo.totalPages,
					});
					setStatus("success");
				})
				.catch((err) => {
					setStatus("error");
					toast.error(err.response.data.message);
				});
		}
	}, [status]);
	return (
		<div className="w-full min-h-full flex  flex-col max-h-full overflow-y-scroll py-5">
			{status=="success"?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
				{visits.map((visit) => (
					<VisitCard key={visit.id} visit={visit} reload={()=>setStatus("loading")} />
				))}
			</div>:<Loading/>}
			<Pager
				pageInfo={pageInfo}
				setPageInfo={setPageInfo}
				reset={() => setStatus("loading")}
			/>
		</div>
	);
}
