import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req:NextRequest){
    const userHeader = req.headers.get("user");
    const user = userHeader ? JSON.parse(userHeader) : null;
    //check if user is admin, manager
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role === "staff") {
               
    }else if (user.role == "admin" || user.role == "manager") {
        
        //get visit id from params
        const visitId = parseInt(req.nextUrl.searchParams.get("visitId") || "-99");
        try{
            //get visit by id
            const visit = await prisma.visit.findUnique({
                where: {
                    id: visitId
                }
            });
            if (!visit) {
                return NextResponse.json({ message: "Visit not found" }, { status: 404 });
            }
            const details:{
                visit: any,
                bills: {invoice:any;total:number}[],
                payments : any[],
                returnBills:{returnBill:any;total:number}[],
                summary:{
                    billCount:number,
                    billTotal:number,
                    paymentCount:number,
                    paymentTotal:number,
                    returnBillCount:number,
                    returnBillTotal:number,
                }
            } = {
                visit : visit,
                bills: [],
                payments : [],
                returnBills : [],
                summary:{
                    billCount:0,
                    billTotal:0,
                    paymentCount:0,
                    paymentTotal:0,
                    returnBillCount:0,
                    returnBillTotal:0,
                }
            }
            //get bills
            const invoices = await prisma.invoice.findMany({
                where: {
                    visit_id: visitId,                    
                }
            });
            for (const invoice of invoices) {
                const items = await prisma.invoice_item.findMany({
                    where: {
                        invoice_id: invoice.id
                    }
                });
                let total = 0;
                for (const item of items) {
                    total += item.price * item.quantity;
                }
                //discount
                total -= invoice.discount;
                details.bills.push({invoice,total});
            }
            details.summary.billCount = details.bills.length;
            details.summary.billTotal = details.bills.reduce((acc,cur)=>acc+cur.total,0);
            //get payments
            const payments = await prisma.payment.findMany({
                where: {
                    visit_id: visitId
                }
            });
            details.payments = payments;
            details.summary.paymentCount = payments.length;
            details.summary.paymentTotal = payments.reduce((acc,cur)=>acc+cur.amount,0);
            //get return bills
            const returnBills = await prisma.return_bill.findMany({
                where: {
                    visit_id: visitId
                }
            });
            for (const returnBill of returnBills) {
                const items = await prisma.return_bill_item.findMany({
                    where: {
                        return_bill_id: returnBill.id
                    }
                });
                let total = 0;
                for (const item of items) {
                    total += item.price * item.quantity;
                }
                details.returnBills.push({returnBill,total});
            }
            details.summary.returnBillCount = details.returnBills.length;
            details.summary.returnBillTotal = details.returnBills.reduce((acc,cur)=>acc+cur.total,0);
            return NextResponse.json({ message: "Visit retrieved successfully", details });
        }catch(e:any){
            return NextResponse.json({ message: e.message }, { status: 404 });
        }

    }
}