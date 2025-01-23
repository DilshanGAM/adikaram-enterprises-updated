import Image from "next/image";

export default function StaffLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
    

    return(
        <div className="w-full h-screen max-h-screen">
            <div className="flex items-center justify-center bg-pepsiBlue relative text-white p-4 h-[60px]">
                <Image src="/favicon.png" alt="Adikaram Enterprises Logo" className="bg-white rounded-full p-1 absolute m-1 left-1" width={50} height={50} />
                <h1 className="text-2xl font-bold  mx-auto">Adikaram Enterprises</h1>
            </div>
            {children}
        </div>
    )
}


