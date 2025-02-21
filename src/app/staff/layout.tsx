"use client";
import Loading from "@/components/loading";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";
import LogoutModal from "@/components/logoutModal";
import { Link } from "lucide-react";
import { usePathname } from "next/navigation";

export default function StaffLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [status, setStatus] = useState("loading"); //success, error
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setStatus("error");
		} else {
			axios
				.get("/api/auth/user", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((res) => {
					if (res.data.message === "User Found") {
						//chekck if user is staff manager or admin
						if (
							res.data.user.role === "staff" ||
							res.data.user.role === "manager" ||
							res.data.user.role === "admin"
						) {
							setStatus("success");
						} else {
							setStatus("error");
						}
					} else {
						setStatus("error");
					}
				})
				.catch(() => {
					setStatus("error");
				});
		}
	}, []);

	return (
		<div className="w-full h-screen max-h-screen">
			<div className="flex items-center justify-center bg-pepsiBlue relative text-white p-4 h-[60px]">
				<Image
					src="/favicon.png"
					alt="Adikaram Enterprises Logo"
					className="bg-white rounded-full p-1 absolute m-1 left-1"
					width={50}
					height={50}
				/>
				<h1 className="text-2xl font-bold  mx-auto">Adikaram Enterprises</h1>
				<NavItem
					link="/staff/settings"
					icon={<FaCog />}
					label="Settings"
					isOpen={false}
				/>
                <div>
                <LogoutModal isOpen={false} />
                </div>
			</div>
			{status == "success" && children}
			{status == "loading" && <Loading />}
			{status == "error" && (
				<div className="flex items-center justify-center h-full">
					You are not authorized to view this page
				</div>
			)}
		</div>
	);
}

interface NavItemProps {
	icon: React.ReactNode;
	label: string;
	isOpen: boolean;
	link: string;
}
const NavItem: React.FC<NavItemProps> = ({
	icon,
	label,
	isOpen,
	link,
}) => {
	const pathname = usePathname();
	let isActive = false;
	if (link === "/admin") {
		isActive = pathname === link;
	} else {
		isActive = pathname.includes(link);
	}

	return (
		<Link
			href={link}
			className={`flex items-center gap-4 px-4 py-2 cursor-pointer ${
				isActive ? "bg-gray-700 text-white" : "hover:bg-gray-600 text-gray-300"
			}`}
		>
			<div className="text-xl">{icon}</div>
			{isOpen && <span className="text-sm">{label}</span>}
		</Link>
	);
};
