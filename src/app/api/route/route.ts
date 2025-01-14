import { NextRequest,NextResponse } from "next/server";
export const dynamic = "force-dynamic"
import { PrismaClient } from "@prisma/client";
import { UserType } from "@/types/user";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    let userHeader = req.headers.get("user");
    let user: UserType | null = userHeader ? JSON.parse(userHeader) : null;
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const routes = await prisma.route.findMany();
    prisma.$disconnect();
    return NextResponse.json(routes );
}

export async function POST(req: NextRequest) {
    //check if admin or manager
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.role !== "manager") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin and manager can create accounts" },
            { status: 401 }
        );
    }
    /*
    model route {
  name        String @id @unique
  description String
  distance    Float
    */
    try {
        const body = await req.json();
        
        let {
            name,
            description,
            distance,
        } = body;

        // Validation
        if (
            !name ||
            !description ||
            !distance
        ) {
            return NextResponse.json(
                { message: "Please fill all required fields" },
                { status: 400 }
            );
        }
        //convert distance to float
        distance = parseFloat(distance);

        const newRoute = await prisma.route.create({
            data: {
                name,
                description,
                distance,
            },
        });

        prisma.$disconnect();
        return NextResponse.json({ message: "Route created", route: newRoute });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

//only admins can edit
export async function PUT(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin can edit routes" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        let {
            name,
            description,
            distance,
        } = body;

        // Validation
        if (
            !name ||
            !description ||
            !distance
        ) {
            return NextResponse.json(
                { message: "Please fill all required fields" },
                { status: 400 }
            );
        }
        //convert distance to float
        distance = parseFloat(distance);

        const updatedRoute = await prisma.route.update({
            where: { name },
            data: {
                description,
                distance,
            },
        });

        prisma.$disconnect();
        return NextResponse.json({ message: "Route updated", route: updatedRoute });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

//only admins can delete

export async function DELETE(req: NextRequest) {
    const userHeader = req.headers.get("user");
    const user: UserType | null = userHeader ? JSON.parse(userHeader) : null;

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
        return NextResponse.json(
            { message: "Unauthorized: Only admin can delete routes" },
            { status: 401 }
        );
    }

    try {
        const name = req.nextUrl.searchParams.get("name");

        if (!name) {
            return NextResponse.json({ message: "Please provide a route name" }, { status: 400 });
        }

        await prisma.route.delete({
            where: { name },
        });

        prisma.$disconnect();
        return NextResponse.json({ message: "Route deleted" });
    } catch (err: any) {
        //check if foreign key constraint
        if (err.code === "P2025") {
            return NextResponse.json(
                { message: "Cannot delete route as it is associated with some shops, bills and visits" },
                { status: 400 }
            );
        }
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
    

