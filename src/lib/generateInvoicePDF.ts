import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: UserOptions) => jsPDF;
    }
}

// Define types for our invoice data structure
interface Product {
    name: string;
}

interface Batch {
    batch_id: string;
}

interface InvoiceItem {
    product: Product;
    batch?: Batch;
    quantity: number;
    price: number;
}

interface FreeItem {
    product: Product;
    batch?: Batch;
    packs: number;
    uom: number;
    loose: number;
}

interface Payment {
    id: string;
    date: string;
    amount: number;
    type: string;
}

interface Shop {
    name: string;
    owner: string;
}

interface Visit {
    route_name: string;
    visited_by: string;
}

interface Invoice {
    id: string;
    shop: Shop;
    visit: Visit;
    date: string;
    status: string;
    items: InvoiceItem[];
    free_items: FreeItem[];
    payments: Payment[];
    discount?: number;
    tax?: number;
}

export function generateInvoicePDF(invoice: Invoice): void {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");

    // Header
    doc.setFontSize(16);
    doc.text("Adikaram Enterprises", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("Email: info@adikaram.com | Address: 123 Main St, Colombo | Phone: +94 76 123 4567", 105, 25, { align: "center" });
    doc.line(15, 30, 195, 30);

    // Invoice Information
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.id}`, 15, 40);
    doc.text(`Shop Name: ${invoice.shop.name}`, 15, 50);
    doc.text(`Shop Owner: ${invoice.shop.owner}`, 15, 60);
    doc.text(`Visit Route: ${invoice.visit.route_name}`, 15, 70);
    doc.text(`Visited By: ${invoice.visit.visited_by}`, 15, 80);
    doc.text(`Invoice Date: ${new Date(invoice.date).toLocaleDateString()}`, 15, 90);
    doc.text(`Status: ${invoice.status}`, 15, 100);

    // Invoice Items Table
    const itemsTableOptions: UserOptions = {
        startY: 110,
        head: [["Product", "Batch ID", "Quantity", "Price", "Total"]],
        body: invoice.items.map((item) => [
            item.product.name,
            item.batch?.batch_id || "N/A",
            item.quantity,
            `${item.price.toFixed(2)}`,
            `${(item.price * item.quantity).toFixed(2)}`
        ]),
    };
    doc.autoTable(itemsTableOptions);

    // Free Items Table
    if (invoice.free_items.length > 0) {
        const freeItemsTableOptions: UserOptions = {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [["Product", "Batch ID", "Quantity"]],
            body: invoice.free_items.map((item) => [
                item.product.name,
                item.batch?.batch_id || "N/A",
                item.packs * item.uom + item.loose,
            ]),
        };
        doc.autoTable(freeItemsTableOptions);
    }

    // Payments Table
    if (invoice.payments.length > 0) {
        const paymentsTableOptions: UserOptions = {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [["Payment ID", "Payment Date", "Amount", "Type"]],
            body: invoice.payments.map((payment) => [
                payment.id,
                new Date(payment.date).toLocaleDateString(),
                `${payment.amount.toFixed(2)}`,
                payment.type
            ]),
        };
        doc.autoTable(paymentsTableOptions);
    }

    // Bill Summary
    const invoiceTotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountTotal = invoice.discount || 0;
    const taxTotal = invoice.tax || 0;
    const netTotal = invoiceTotal - discountTotal + taxTotal;

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text(`Total Amount: ${invoiceTotal.toFixed(2)}`, 15, finalY + 20);
    doc.text(`Discount: -${discountTotal.toFixed(2)}`, 15, finalY + 30);
    doc.text(`Tax: +${taxTotal.toFixed(2)}`, 15, finalY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Total: ${netTotal.toFixed(2)}`, 15, finalY + 50);

    // Save PDF
    doc.save(`Invoice_${invoice.id}.pdf`);
}