"use client";

import VisitCard from "@/components/visitCard";
import { VisitType } from "@/types/user";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VisitsPage() {
    const [status, setStatus] = useState("loading");
    const [visits, setVisits] = useState<VisitType[]>([]);
    useEffect(() => {
        axios.get("/api/visit/active" , {
            headers: {
                user: localStorage.getItem("user")
            }
        }).then((res) => {
            setVisits(res.data.visits);
            setStatus("success");
        }).catch((err) => {
            setStatus("error");
            toast.error(err.response.data.message);
        });
    }, []);
    return (
        <div className="w-full min-h-full flex flex-wrap flex-row ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {visits.map((visit) => (
                    <VisitCard key={visit.id} visit={visit} />
                ))}
            </div>
        </div>
    );
}
