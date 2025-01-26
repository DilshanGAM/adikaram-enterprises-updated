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
    visited_by: string;
    route_name: string;
    status: string;
    date: Date;
    visit_id: number;
}
/*
model invoice_item {
  id           Int       @id @default(autoincrement())
  invoice_id   Int
  product_key  String
  batch_id     Int?
  uom          Int
  packs        Int
  loose        Int
  quantity     Int
  price        Float
}
*/
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
}


export interface FreeItemType{
    id: number;
    invoice_id: number;
    product_key: string;
    batch_id: number;
    uom: number;
    packs: number;
    loose: number;
}
