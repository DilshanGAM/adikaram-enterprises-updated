export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	//check if user is available
	const userHeader = req.headers.get("user");
	const user = userHeader ? JSON.parse(userHeader) : null;
	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
	if (
		user.role !== "admin" &&
		user.role !== "manager" &&
		user.role !== "staff"
	) {
		return NextResponse.json(
			{
				message:
					"Unauthorized: Only admin, manager and staff can create accounts",
			},
			{ status: 401 }
		);
	}
	const body = await req.json();
	const { previousShop, shopData } = body;
	//get current visit
	try {
		const startedVisit = await prisma.visit.findFirst({
			where: {
				visited_by: user.email,
				status: "started",
			},
		});
		if (!startedVisit) {
			return NextResponse.json(
				{ message: "No visit started" },
				{ status: 404 }
			);
		}
		const shop_route = await prisma.shop_route.findFirst({
			where: {
				route_name: startedVisit.route_name,
				shop_name: previousShop,
			},
		});
		if (!shop_route) {
			return NextResponse.json(
				{
					message:
						"Shop name " +
						previousShop +
						" does not available in the route " +
						startedVisit.route_name,
				},
				{ status: 404 }
			);
		}

		let {
			name,
			address,
			phone,
			whatsapp,
			status,
			owner,
			max_credit,
			longitude,
			latitude,
		} = shopData;

		if (!name || !address || !phone || !owner || max_credit === undefined) {
			return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
		}
		//convert max_credit, logitude and latitude to float
		max_credit = parseFloat(max_credit);
		longitude = parseFloat(longitude);
		latitude = parseFloat(latitude);

		const shop = await prisma.shop.create({
			data: {
				name,
				address,
				phone,
				whatsapp,
				status: status || "active",
				owner,
				max_credit,
				longitude: longitude || null,
				latitude: latitude || null,
			},
		});
        //shop_route.order

        //update all shop_routes in the route with order higheer that the current shop_route by 1
        const shopRoutes = await prisma.shop_route.findMany({
            where: {
                route_name: startedVisit.route_name,
                order: {
                    gt: shop_route.order
                }
            }
        });
        const updateShopRoutes = shopRoutes.map((shopRoute) => {
            return prisma.shop_route.update({
				where: {
					route_name_shop_name: {
						route_name: startedVisit.route_name,
						shop_name: shopRoute.shop_name
					}
				},
                data: {
                    order: shopRoute.order + 1
                }
            });
        });
        await prisma.$transaction(updateShopRoutes);
        await prisma.shop_route.create({
            data: {
                route_name: startedVisit.route_name,
                shop_name: shop.name,
                order: shop_route.order + 1
            }
        });
        return NextResponse.json(
            {
                message: "Shop created successfully",
                shop,
            },
            { status: 201 }
        );
	} catch (err) {
		return NextResponse.json(
			{ message: "Error getting current visit", err },
			{ status: 500 }
		);
	}
}
