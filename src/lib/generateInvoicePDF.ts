import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface Product { name: string }
interface Batch { batch_id: string }
interface InvoiceItem {
  product: Product;
  batch?: Batch;
  uom: number;     // units per pack
  packs: number;
  loose: number;
  price: number;   // unit price (per single unit)
}
interface FreeItem {
  product: Product;
  batch?: Batch;
  packs: number;
  uom: number;
  loose: number;
}
interface Payment { id: string; date: string; amount: number; type: string }
interface Shop { name: string; owner: string }
interface Visit { route_name: string; visited_by: string }
interface Invoice {
  id: string;
  shop: Shop;
  visit: Visit;
  date: string;      // ISO string
  status: string;
  items: InvoiceItem[];
  free_items: FreeItem[];
  payments: Payment[];
  discount?: number;
  tax?: number;
}

export function generateInvoicePDF(invoice: Invoice): void {
  // Exact bill width: 9.5 cm (95 mm)
  const doc = new jsPDF({ unit: "mm", format: [95, 297] });

  const marginX = 5;
  const pageWidth = 95;
  const contentWidth = pageWidth - marginX * 2;

  // Helpers
  const currency = (n: number) => n.toFixed(2);

  // Header
  doc.setFont("helvetica", "bold");
  let y = 8;
  doc.setFontSize(13);
  doc.text("OLE MARKETING (PVT) LTD.", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(11);
  doc.text("ADIKARAM ENTERPRISES", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(8);
  doc.text(
    "No. 410, Agalawatta Road, Weththewa, Mathugama, Tel: 077 365 8285",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Meta rows
  y += 6;
  doc.setFontSize(8);
  doc.text(`Shop: ${invoice.shop?.name || "-"}`, marginX, y, { align: "left" });
  doc.text(
    `Date: ${new Date(invoice.date).toLocaleDateString()}`,
    pageWidth - marginX,
    y,
    { align: "right" }
  );

  y += 5;
  doc.text(`Bill No: ${invoice.id}`, marginX, y, { align: "left" });
  doc.text(
    `Visited by: ${invoice.visit?.visited_by || "-"}`,
    pageWidth - marginX,
    y,
    { align: "right" }
  );

  y += 3;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 3;

  // Items heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Items", marginX, y);
  y += 3;

  const itemsBody = (invoice.items || []).map((it) => {
    const totalQty = it.packs * it.uom + it.loose;
    const lineTotal = totalQty * it.price;
    return [
      it.product?.name || "-",             // Product ID (using product name)
      it.batch?.batch_id || "N/A",         // Batch ID
      String(it.loose ?? 0),               // Loose
      String(it.packs ?? 0),               // Packs
      String(it.uom ?? 0),                 // UOM
      String(totalQty),                    // Total Qty
      currency(it.price),                  // Price
      currency(lineTotal),                 // Total
    ];
  });

  // Monochrome grid (black text, black borders, no fills)
  const gridStyles = {
    theme: "grid" as const,
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      textColor: [0, 0, 0] as [number, number, number],
      lineColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.2,
    },
    headStyles: {
      fontStyle: "bold" as const,
      textColor: [0, 0, 0] as [number, number, number],
      fillColor: [255, 255, 255] as [number, number, number], // no gray fills
      lineColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.2,
    },
    bodyStyles: {
      textColor: [0, 0, 0] as [number, number, number],
      lineColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.2,
    },
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
  };

  doc.autoTable({
    startY: y,
    ...gridStyles,
    head: [[
      "Product ID",
      "Batch ID",
      "Loose",
      "Packs",
      "UOM",
      "Total Qty",
      "Price",
      "Total",
    ]],
    body: itemsBody,
  });

  let cursorY = (doc as any).lastAutoTable?.finalY ?? y;

  // Free items
  if (invoice.free_items && invoice.free_items.length > 0) {
    cursorY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Free Items", marginX, cursorY);
    cursorY += 3;

    const freeBody = invoice.free_items.map((it) => {
      const totalQty = it.packs * it.uom + it.loose;
      return [
        it.product?.name || "-",
        it.batch?.batch_id || "N/A",
        String(it.loose ?? 0),
        String(it.packs ?? 0),
        String(it.uom ?? 0),
        String(totalQty),
        "FREE",
        "0.00",
      ];
    });

    doc.autoTable({
      startY: cursorY,
      ...gridStyles,
      head: [[
        "Product ID",
        "Batch ID",
        "Loose",
        "Packs",
        "UOM",
        "Total Qty",
        "Price",
        "Total",
      ]],
      body: freeBody,
    });

    cursorY = (doc as any).lastAutoTable.finalY;
  }

  // -------- Totals block (right-aligned, just after the last table) --------
  const invoiceTotal = (invoice.items || []).reduce((acc, it) => {
    const totalQty = it.packs * it.uom + it.loose;
    return acc + totalQty * it.price;
  }, 0);
  const discountTotal = invoice.discount ?? 0;
  const taxTotal = invoice.tax ?? 0;
  const netTotal = invoiceTotal - discountTotal + taxTotal;

  cursorY += 4;
  const labelX = pageWidth - marginX - 40; // 40mm label/value block width
  const valueX = pageWidth - marginX;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const rowH = 4;
  // Total

  doc.text(currency(invoiceTotal), valueX, cursorY, { align: "right" });
  // draw with label to the left
  doc.text("Total", labelX, cursorY, { align: "left" });

  // Discount
  cursorY += rowH;
  doc.text("Discount", labelX, cursorY, { align: "left" });
  doc.text(currency(discountTotal), valueX, cursorY, { align: "right" });

  // Tax
  cursorY += rowH;
  doc.text("Tax", labelX, cursorY, { align: "left" });
  doc.text(currency(taxTotal), valueX, cursorY, { align: "right" });

  // Net Total (bold)
  cursorY += rowH;
  doc.setFont("helvetica", "bold");
  doc.text("Net Total", labelX, cursorY, { align: "left" });
  doc.text(currency(netTotal), valueX, cursorY, { align: "right" });
  doc.setFont("helvetica", "normal");

  // Small divider before footer
  cursorY += 4;
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 16;

  // -------- Footer: 3 horizontally-aligned slots --------
  const slotWidth = contentWidth / 3;

  // Signature/Fill lines
  const lineY = cursorY;
  for (let i = 0; i < 3; i++) {
    const x1 = marginX + i * slotWidth + 2;
    const x2 = marginX + (i + 1) * slotWidth - 2;
    doc.line(x1, lineY, x2, lineY);
  }

  // Left label
  const centerX0 = marginX + slotWidth * 0 + slotWidth / 2;
  const centerX1 = marginX + slotWidth * 1 + slotWidth / 2;
  const centerX2 = marginX + slotWidth * 2 + slotWidth / 2;

  // Labels (left & right)
  doc.setFontSize(8);
  doc.text("Customer Signature", centerX0, lineY + 4, { align: "center" });
  doc.text("P.S.R", centerX2, lineY + 4, { align: "center" });

  // Middle: Shop Owner NAME printed ON the line, wrapped if long
  // We’ll split into lines that fit the slot, stack upwards, and place the last line baseline ON the line.
  const ownerName = (invoice.shop?.owner || "-").trim();
  const maxTextWidth = slotWidth - 6; // padding within slot
  const ownerLines = doc.splitTextToSize(ownerName, maxTextWidth) as string[];
  const maxLinesToShow = Math.min(ownerLines.length, 2); // show up to 2 lines if needed

  // Position: last line baseline sits on the line; previous line(s) stacked upward
  const lineGap = 3; // vertical gap between wrapped lines
  for (let i = 0; i < maxLinesToShow; i++) {
    const idxFromBottom = maxLinesToShow - 1 - i; // 0 => bottom (on line)
    const text = ownerLines[ownerLines.length - 1 - i];
    const yPos = lineY - idxFromBottom * lineGap - 0.6; // bottom line ~on the line; others above
    doc.text(text, centerX1, yPos, { align: "center" });
  }
  // Label under the line to clarify
  doc.text("Shop Owner", centerX1, lineY + 4, { align: "center" });

  // Save
  doc.save(`Invoice_${invoice.id}.pdf`);
}
