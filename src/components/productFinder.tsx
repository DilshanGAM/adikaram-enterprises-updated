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
import { ProductType, UserType } from "@/types/user";

export function ProductFinder({ val, onChange , openView }: any) {
	val = val || "";
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(val);
	const [productsList, setProductList] = useState<ProductType[]>([]);
	const [productListLoaded, setProductListLoaded] = useState(false);

	React.useEffect(() => {
		getProductsByQuery("");
	}, []);

	async function getProductsByQuery(query: string) {
        setValue(query);
		const token = localStorage.getItem("token");
		setProductListLoaded(false);
		axios
			.get("/api/products/find?query=" + query, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				console.log(res.data);
				setProductList(res.data.products);
				setProductListLoaded(true);
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
						? productsList.find((product) => product.key === value)?.key
						: "Search Products"}
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
						{productListLoaded ? (
							<>
								<CommandEmpty>No Users found.</CommandEmpty>
								<CommandGroup>
									{productsList.map((product) => (
										<CommandItem
											key={product.key}
											value={product.key}
											onSelect={() => {
												setValue(product.key);
												onChange(product.key , product);
												setOpen(false);
                                                openView();
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === product.key ? "opacity-100" : "opacity-0"
												)}
											/>
											{product.key}
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
