"use client"
//import { useState } from "react";
import { Input } from "./ui/input";
import { TableCell, TableRow } from "./ui/table";

export default function ItemRow({item, index}: {item: any, index: number}) {
    //const [selected, setSelected] = useState(false);
    function handleSelectChange(e: any) {
        console.log(e.target.value);
    }
    return (
        <TableRow key={index}>
            <TableCell><Input type="checkbox" onChange={handleSelectChange}/></TableCell>
            <TableCell>{item.product.key}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.price}</TableCell>
        </TableRow>
    );

}