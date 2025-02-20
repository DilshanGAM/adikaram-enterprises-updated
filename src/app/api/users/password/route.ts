export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
export async function POST(req: NextRequest) {
    const user = req.headers.get("user");
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userObj = JSON.parse(user);
    //check if user is manager or admin
    if (userObj.role !== "manager" && userObj.role !== "admin"&& userObj.role !== "staff") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { password , confirmPassword} = await req.json();
    if (!password||!confirmPassword) {
        return NextResponse.json({ message: "Missing password field" }, { status: 400 });
    }
    if(password!==confirmPassword){
        return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await prisma.user.update({
            where: {
                email: userObj.email,
            },
            data: {
                password: hashedPassword,
            },
        });
        return NextResponse.json({ message: "Password updated successfully" });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}