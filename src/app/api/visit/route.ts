import { NextRequest , NextResponse } from "next/server";

export const dynamic = "force-dynamic"

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    //check if admin manager or staff
    const userHeader = req.headers.get("user");
    const user = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "admin" && user.role !== "manager" && user.role !== "staff") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin, manager and staff can create accounts" },
            { status: 401 }
        );
    }
    //check if there started visit available for the user
    const startedVisit = await prisma.visit.findFirst({
        where: {
            visited_by: user.email,
            status: "started"
        }
    });
    if(startedVisit){
        return NextResponse.json({ message: "Visit already started" }, { status: 400 });
    }
    //create new visit
    const body = await req.json();
    const routeName = body.routeName;
    const visitedBy = user.email;
    const visit = await prisma.visit.create({
        data: {
            visited_by: visitedBy,
            route_name: routeName
        }
    });
    return NextResponse.json({
        message: "Visit created successfully",
        visit
    }, { status: 201 });

}
export async function PUT(req: NextRequest) {
    //check if admin manager or staff
    const userHeader = req.headers.get("user");
    const user = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "admin" && user.role !== "manager" ) {
        return NextResponse.json(
            { message: "Unauthorized: Only admin, manager and staff can update visits" },
            { status: 401 }
        );
    }
    const idInString = req.nextUrl.searchParams.get("id") || "";
    if (idInString === "") {
        return NextResponse.json({ message: "Visit id is missing" }, { status: 400 });
    }
    const id = parseInt(idInString);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Visit id is invalid" }, { status: 400 });
    }
    //check if there started visit available for the user
    const startedVisit = await prisma.visit.findFirst({
        where: {
            id:id
        }
    });
    if(!startedVisit){
        return NextResponse.json({ message: "Visit not found" }, { status: 404 });
    }
    //update visit
    const body = await req.json();
    const routeName = body.routeName;
    const visitedBy = user.email;
    const visit = await prisma.visit.update({
        where: {
            id: startedVisit.id
        },
        data: {
            confirmed_by: user.email,
            end_time: new Date(),
            status: "completed"
        }
    });
    return NextResponse.json({
        message: "Visit updated successfully",
        visit
    }, { status: 200 });

}