"use client";


import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { TableCell, TableRow } from "./ui/table";

export default function FreeItemRow({ item, index,setInvoiceItems , invoiceItems }: { item: any; index: number; setInvoiceItems: any; invoiceItems: any[] }) {

  
	function handleSelectChange() {
        // setSelected(!selected);
        const newInvoiceItems = [...invoiceItems];
        newInvoiceItems[index].selected = !newInvoiceItems[index].selected;
        setInvoiceItems(newInvoiceItems);
	}
	function handleQuantityChange(e: any) {
		const valInNumber = parseInt(e.target.value);
		if (!isNaN(valInNumber)) {
            const newInvoiceItems = [...invoiceItems];
            newInvoiceItems[index].qty = valInNumber;
            setInvoiceItems(newInvoiceItems);
		} else {
            const newInvoiceItems = [...invoiceItems];
            newInvoiceItems[index].qty = 0;
            setInvoiceItems(newInvoiceItems);
		}
	}

	function handlePriceChange(e: any) {
		const valInNumber = parseInt(e.target.value);
		if (!isNaN(valInNumber)) {
            const newInvoiceItems = [...invoiceItems];
            newInvoiceItems[index].price = valInNumber;
            setInvoiceItems(newInvoiceItems);
		} else {
            const newInvoiceItems = [...invoiceItems];
            newInvoiceItems[index].price = 0;
            setInvoiceItems(newInvoiceItems);
		}
	}

    function handleReasonChange(e: any) {
        const newInvoiceItems = [...invoiceItems];
        newInvoiceItems[index].reason = e;
        setInvoiceItems(newInvoiceItems);
    }
	return (
		<TableRow className="cursor-pointer" key={index}>
			<TableCell>
				<Input
					onChange={handleSelectChange}
					checked={item.selected}
					type="checkbox"
				/>
			</TableCell>
			<TableCell>{item.item.product.key}</TableCell>
			<TableCell>{item.item.quantity}</TableCell>
			<TableCell>{item.item.price}</TableCell>

		
				<>
					<TableCell>
						<Input
                            disabled={!item.selected}
							value={item.qty}
							onChange={handleQuantityChange}
							type="number"
                            className="w-20"
						/>
					</TableCell>
					<TableCell>
						<Input className="w-20" disabled={!item.selected} value={item.price} onChange={handlePriceChange} type="number" />
					</TableCell>
					<TableCell>
						<Select
                       
                        disabled={!item.selected}
                        value={
                            item.reason
                        } onValueChange={handleReasonChange} >
							<SelectTrigger className="w-20">
								<SelectValue >{item.reason}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Reason</SelectLabel>
									<SelectItem value="expired">Expired</SelectItem>
									<SelectItem value="gas-leak">Gas Leak</SelectItem>
									<SelectItem value="damaged">Damaged</SelectItem>
									<SelectItem value="wrong-item">Wrong Item</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</TableCell>
				</>
			
		</TableRow>
	);
}