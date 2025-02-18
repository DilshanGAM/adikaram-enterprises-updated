export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
	/*model driver_visit{
  id              Int       @id @default(autoincrement())
  driver_name     String
  verified_by     String
  date           DateTime  @default(now())
  status         String    @default("processing")//completed
  notes          String?
  verified_by_user user      @relation(fields: [verified_by], references: [email])
  payments       payment[]
}*/
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObj = JSON.parse(user);
    //check if user is manager or admin
    if (userObj.role !== "manager" && userObj.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try{
        const body = await req.json();
        const driverVisit = await prisma.driver_visit.findFirst({
            where: {
                verified_by: userObj.email,
                status: "processing",
            },
        });
        if (driverVisit) {
            return NextResponse.json({ message: "There is an ongoing driver visit started. please clear it before start another one" }, { status: 400 });            
        }
        const newDriverVisit = await prisma.driver_visit.create({
            data: {
                driver_name: body.driver_name,
                verified_by: userObj.email,
                notes: body.notes,
            },
        });
        return NextResponse.json({ newDriverVisit, message: "Success" });
        
    }catch(e:any){
        if(e.message){
            return NextResponse.json({ message: e.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObj = JSON.parse(user);
    //check if user is manager or admin
    if (userObj.role !== "manager" && userObj.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const driverVisit = await prisma.driver_visit.findFirst({
            where: {
                verified_by: userObj.email,
                status: "processing",
            },
            include: {
                payments: true,
            },
        });
        if (!driverVisit) {
            return NextResponse.json({ message: "No any processing driver visit found" }, { status: 404 });
        }
        return NextResponse.json({ driverVisit, message: "Success" });
    } catch (e:any) {
        if(e.message){
            return NextResponse.json({ message: e.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObj = JSON.parse(user);
    //check if user is manager or admin
    if (userObj.role !== "manager" && userObj.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const driverVisit = await prisma.driver_visit.findFirst({
            where: {
                verified_by: userObj.email,
                status: "processing",
            },
        });
        if (!driverVisit) {
            return NextResponse.json({ message: "No any processing driver visit found" }, { status: 404 });
        }
        const data = await req.json();
        const updatedDriverVisit = await prisma.driver_visit.update({
            where: {
                id: driverVisit.id,
            },
            data: {
                status: "completed",
                notes: data.notes,
            },
        });
        return NextResponse.json({ updatedDriverVisit, message: "Success" });
    } catch (e:any) {
        console.log(e);
        if(e.message){
            return NextResponse.json({ message: e.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
