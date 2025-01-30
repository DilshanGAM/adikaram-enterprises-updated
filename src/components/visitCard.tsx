"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitType } from "@/types/user";
import { format } from "date-fns";
import VisitDetailsModal from "./visitDetailsModal";

export default function VisitCard({ visit }: { visit: VisitType }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Card className="w-full max-w-md bg-white shadow-lg border rounded-lg relative">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-pepsiBlue">
                        Route: {visit.route_name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Status: <span className="font-semibold">{visit.status}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-700 space-y-2 ">
                        <p>
                            <span className="font-semibold">Visited By:</span> {visit.visited_by}
                        </p>
                        <p>
                            <span className="font-semibold">Start Time:</span>{" "}
                            {format(new Date(visit.start_time), "PPP p")}
                        </p>
                        {visit.end_time && (
                            <p>
                                <span className="font-semibold">End Time:</span>{" "}
                                {format(new Date(visit.end_time), "PPP p")}
                            </p>
                        )}
                        {visit.confirmed_by && (
                            <p>
                                <span className="font-semibold">Confirmed By:</span> {visit.confirmed_by}
                            </p>
                        )}
                        {visit.notes && (
                            <p>
                                <span className="font-semibold">Notes:</span> {visit.notes}
                            </p>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="default" onClick={() => setIsModalOpen(true)}>View Details</Button>
                    </div>
                    {visit.status === "started" && (
                        <div className="w-3 h-3 bg-green-400 absolute rounded-full top-3 right-3"></div>
                    )}
                </CardContent>
            </Card>

            {/* Visit Details Modal */}
            {isModalOpen && <VisitDetailsModal visit={visit} onClose={() => setIsModalOpen(false)} />}
        </>
    );
}
