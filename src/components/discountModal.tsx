import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { InvoiceType } from "@/types/user";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function DiscountModal({
	invoice,
	setInvoice,
    summaryResetter,
    setSummaryResetter
}: {
	invoice: InvoiceType;
	setInvoice: React.Dispatch<React.SetStateAction<InvoiceType>>;
    summaryResetter: boolean;
    setSummaryResetter: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [discount, setDiscount] = useState(invoice.discount || 0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleSave = () => {
		setInvoice({ ...invoice, discount });
        setSummaryResetter(!summaryResetter);
        setIsDialogOpen(false);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
                <button className="text-xl font-bold text-pepsiBlue">
                    Discount: {invoice.discount}
                </button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Discount</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Discount Amount
					</label>
                    <Input
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value))}
                        type="number"
                    />
				</div>
				<DialogFooter>
					<Button variant="secondary">Cancel</Button>
					<Button onClick={handleSave}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
