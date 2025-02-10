export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    //get user
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({"message": "Unauthorized"}, {status: 401});
    }
    //check if the user is a staff manager or admin
    const userObj = JSON.parse(user);
    if (userObj.role !== "staff_manager" && userObj.role !== "admin") {
        return NextResponse.json({"message": "Unauthorized for the user role. Contact admin"}, {status: 401});
    }
    //get the return bill id
    const id = req.nextUrl.searchParams.get("id") || -99;
    if (id == -99) {
        return NextResponse.json({ error: "id not found" }, { status: 400 });
    }
    //get the return bill
    try{
        const returnBillId = Number(id);
        const returnBill = await prisma.return_bill.findUnique({
            where: { id: returnBillId },
            include: {
                visit: {
                    include: {
                        visited_by_user: true,
                        confirmed_by_user: true,
                    }
                },
                shop: true,
                items: {
                    include: {
                        product: true,
                        batch: true,
                        invoice_item: {
                            include: {
                                batch: true,
                            }
                        },
                        free_item: {
                            include: {
                                batch: true,
                            }
                        },
                    }
                }
            }
        });
        if (!returnBill) {
            return NextResponse.json({ message: "Return Bill not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Return Bill found", returnBill });

    }catch(e:any){
        if(e.message){
            return NextResponse.json({message: e.message}, {status: 500});
        }else{
            return NextResponse.json({message: "Internal Server Error"}, {status: 500});
        }
    }
}