export interface UserType {
    name: string;
    email: string;
    role: string;
    phone: string;
    title : string;
    whatsapp : string;
    address? : string;
    status? : string;
}
export interface ProductType{
    barcode? : string;
    key: string;
    name: string;
    stock: number;
    container_type: string;
    uom: number;
    volume: string;
    flavour: string;
    default_labeled_price: number;
    default_cost: number;
    product_image: string;
    status: string;
}
export interface BatchType{
    batch_id: number;
    product_key: string;
    product: ProductType;
    uom: number;
    packs: number;
    loose: number;
    mfd: Date;
    exp: Date;
    cost: number;
    labeled_price: number;
    purchase_invoice_id: string;
    date: Date;
    added_by: string;
    status: string;
    remaining: number;
    in_count: number;
}

//shop
export interface ShopType{
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    status: string;
    owner: string;
    max_credit: number;
    longitude: string;
    latitude: string;
}
//shop_route
export interface ShopRouteType{
    order: number;
    route_name: string;
    shop_name: string;
}

export interface RouteType{
    name: string;
    description: string;
    distance: number;
}
export interface VisitType{
    id: number;
    route_name: string;
    visited_by: string;
    start_time: Date;
    end_time?: Date;
    confirmed_by?: string;
    status: string;
    notes?: string;
}
export interface InvoiceItemType{
    id: number;
    invoice_id: number;
    product_key: string;
    batch_id: number;
    uom: number;
    packs: number;
    loose: number;
    quantity: number;
    price: number;
}


export interface InvoiceType{
    id?: number;
    shop_name: string;
    date?: Date;
    visit_id: number;
    discount?: number;
    delivered_date?: Date;
    type: string;
    status: string;
    tax: number;
    items? : InvoiceItemType[];
    freeItems? : FreeItemType[];
    shop?: ShopType;
    visit?: VisitType;
    returns?: InvoiceItemType[];

}


export interface FreeItemType{
    id: number;
    invoice_id: number;
    product_key: string;
    batch_id: number;
    uom: number;
    packs: number;
    loose: number;
    quantity: number;
}
/*
model payment {
  id              Int       @id @default(autoincrement())
  shop_name       String
  date            DateTime  @default(now())
  visit_id        Int?
  invoice_id      Int
  amount          Float
  type            String    @default("cash")
  return_bill_id  Int?
  payment_return_bill return_bill? @relation(fields: [return_bill_id], references: [id])
  invoice         invoice   @relation(fields: [invoice_id], references: [id])
  shop            shop      @relation(fields: [shop_name], references: [name])
  visit           visit?    @relation(fields: [visit_id], references: [id])
}

model return_bill {
  id             Int       @id @default(autoincrement())
  shop_name      String
  date           DateTime  @default(now())
  visit_id       Int
  returned_date  DateTime?
  status         String    @default("not-covered")
  deductions     Float     @default(0)
  covered_in     Int?
  items          return_bill_item[]
  payment        payment[]
  shop           shop      @relation(fields: [shop_name], references: [name])
}
*/
export interface PaymentType{
    id: number;
    shop_name: string;
    date: Date;
    visit_id?: number;
    invoice_id: number;
    amount: number;
    type: string;
    return_bill_id?: number;
    payment_return_bill?: ReturnBillType;
    invoice: InvoiceType;
    shop: ShopType;
    visit?: VisitType;
}
export interface ReturnBillItemType{
    id: number;
    return_bill_id: number;
    product_key: string;
    batch_id?: number;
    quantity: number;
    price: number;
    invoice_item_id?: number;
    invoice_free_item_id?: number;
    reason: string;
    return_bill?: ReturnBillType;
    product?: ProductType;
    batch?: BatchType;
    invoice_item?: InvoiceItemType;
    free_item?: FreeItemType;
    invoice_ref?: InvoiceType;
}

export interface ReturnBillType{
    id: number;
    shop_name: string;
    date: Date;
    visit_id: number;
    returned_date?: Date;
    status: string;
    deductions: number;
    value : number;
    items_cost : number;
    covered_in?: number;
    items: ReturnBillItemType[];
    payments: PaymentType[];
    shop?: ShopType;
}

