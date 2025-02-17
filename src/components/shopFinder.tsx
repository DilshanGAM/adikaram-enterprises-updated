"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useState } from "react";
import { ProductType, ShopType, UserType } from "@/types/user";

export function ShopFinder({  selectShop }: any) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [shopsList, setShopList] = useState<ShopType[]>([]);
	const [shopListLoaded, setShopListLoaded] = useState(false);

	React.useEffect(() => {
		getProductsByQuery("");
	}, []);

	async function getProductsByQuery(query: string) {
        setValue(query);
		const token = localStorage.getItem("token");
		setShopListLoaded(false);
		axios
			.get("/api/shop/find?query=" + query, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				console.log(res.data);
				setShopList(res.data.shops);
				setShopListLoaded(true);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value
						? shopsList.find((shop) => shop.name === value)?.name
						: "Search Shops"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0 z-[9999]">
				<Command>
					<CommandInput
						placeholder="Search Products"
						onValueChange={(e) => {
							getProductsByQuery(e);
						}}
					/>
					<CommandList>
						{shopListLoaded ? (
							<>
								<CommandEmpty>No products found</CommandEmpty>
								<CommandGroup>
									{shopsList.map((shop) => (
										<CommandItem
											key={shop.name}
											value={shop.name}
											onSelect={() => {
												setValue(shop.name);
												setOpen(false);
                                                selectShop(shop);
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === shop.name ? "opacity-100" : "opacity-0"
												)}
											/>
											{shop.name}
										</CommandItem>
									))}
								</CommandGroup>
							</>
						) : (
							<div className="w-full flex justify-center items-center h-48">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border border-b-2 border-b-blueGreen"></div>
							</div>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
