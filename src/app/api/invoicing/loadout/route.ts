export const dynamic = "force-dynamic";
import { NextRequest , NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
    
    const fromDate : string = req.nextUrl.searchParams.get("fromDate")!;
    const toDate : string = req.nextUrl.searchParams.get("toDate")!;


    //toDate 11:59pm
    const toDate1159 = new Date(toDate);
    toDate1159.setHours(23);
    toDate1159.setMinutes(59);
    toDate1159.setSeconds(59);

    const allInvoices = await prisma.invoice.findMany({
        where: {
            date: {
                gte: new Date(fromDate),
                lte: toDate1159,
            },
        },
        include: {
            items: {
                include: {
                    batch: true,
                    product: true,
                },
            },
            payments: true,
            free_items: {
                include: {
                    batch: true,
                    product: true,
                },
            }
        },
    });

    // const loadOut:[
    //     {
    //         product : any,
    //         batches : [
    //             {
    //                 batch : any,
    //                 quantity : number
    //             }
    //         ],
    //         quantity : number,
    //         nonBatchQuantity : number            
    //     }
    // ] = []
    const loadOut: Array<{
        product: any,
        batches: Array<{
            batch: any,
            quantity: number
        }>,
        quantity: number,
        nonBatchQuantity: number            
    }> = []

    for (let i = 0; i < allInvoices.length; i++) {
        for (let j = 0; j < allInvoices[i].items.length; j++) {
            //check if the item is batch or not
            if(allInvoices[i].items[j].batch){
                const index = loadOut.findIndex((item) => item.product.key === allInvoices[i].items[j].product.key);
                if (index === -1) {
                    loadOut.push({
                        product: allInvoices[i].items[j].product,
                        batches: [
                            {
                                batch: allInvoices[i].items[j].batch,
                                quantity: allInvoices[i].items[j].quantity
                            }
                        ],
                        quantity: allInvoices[i].items[j].quantity,
                        nonBatchQuantity: 0
                    });
                }else{
                    //check if the batch is available or not
                    const batchIndex = loadOut[index].batches.findIndex((batch) => batch.batch.batch_id === allInvoices[i].items[j].batch?.batch_id);
                    if (batchIndex === -1) {
                        loadOut[index].batches.push({
                            batch: allInvoices[i].items[j].batch,
                            quantity: allInvoices[i].items[j].quantity
                        });
                        loadOut[index].quantity += allInvoices[i].items[j].quantity;
                    }else{
                        loadOut[index].batches[batchIndex].quantity += allInvoices[i].items[j].quantity;
                        loadOut[index].quantity += allInvoices[i].items[j].quantity;
                    }
                }
            }else{
                const index = loadOut.findIndex((item) => item.product.key === allInvoices[i].items[j].product.key);
                if (index === -1) {
                    loadOut.push({
                        product: allInvoices[i].items[j].product,
                        batches: [],
                        quantity: allInvoices[i].items[j].quantity,
                        nonBatchQuantity: allInvoices[i].items[j].quantity
                    });
                }else{
                    loadOut[index].nonBatchQuantity += allInvoices[i].items[j].quantity;
                    loadOut[index].quantity += allInvoices[i].items[j].quantity;
                }
            }
        }
        for (let j = 0; j < allInvoices[i].free_items.length; j++) {
            //check if the item is batch or not
            if(allInvoices[i].free_items[j].batch){
                const index = loadOut.findIndex((item) => item.product.key === allInvoices[i].free_items[j].product.key);
                if (index === -1) {
                    loadOut.push({
                        product: allInvoices[i].free_items[j].product,
                        batches: [
                            {
                                batch: allInvoices[i].free_items[j].batch,
                                quantity: (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose
                            }
                        ],
                        quantity: (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose,
                        nonBatchQuantity: 0
                    });
                }else{
                    //check if the batch is available or not
                    const batchIndex = loadOut[index].batches.findIndex((batch) => batch.batch.batch_id === allInvoices[i].free_items[j].batch?.batch_id);
                    if (batchIndex === -1) {
                        loadOut[index].batches.push({
                            batch: allInvoices[i].free_items[j].batch,
                            quantity: (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose
                        });
                        loadOut[index].quantity += (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose;
                    }else{
                        loadOut[index].batches[batchIndex].quantity += (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose;
                        loadOut[index].quantity += (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose;
                    }
                }
            }else{
                
                const index = loadOut.findIndex((item) => item.product.key === allInvoices[i].free_items[j].product.key);
                if (index === -1) {
                    loadOut.push({
                        product: allInvoices[i].free_items[j].product,
                        batches: [],
                        quantity: (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose,
                        nonBatchQuantity: (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose
                    });
                }else{
                    loadOut[index].nonBatchQuantity += (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose;
                    loadOut[index].quantity += (allInvoices[i].free_items[j].packs*allInvoices[i].free_items[j].uom) + allInvoices[i].free_items[j].loose;
                }
            }
        }

    }
    return NextResponse.json(loadOut);

    
}