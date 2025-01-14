"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopRouteType, ShopType } from "@/types/user";

export default function ManageShopsInRoutePage() {
    const searchParams = useSearchParams();
  const routeName = searchParams.get("routeName") || "";
  const [shopsInRoute, setShopsInRoute] = useState<ShopRouteType[]>([]);
  const [allShops, setAllShops] = useState<ShopType[]>([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Fetch shops in the current route
  useEffect(() => {
    //get the routeName from url parameters

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [routeShopsRes, allShopsRes] = await Promise.all([
          axios.get(`/api/route/shops?routeName=${routeName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/shop", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setShopsInRoute(routeShopsRes.data.shops);
        setAllShops(allShopsRes.data.shops);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch data");
      }
    };

    fetchData();
  }, [routeName]);

  // Handle adding a shop to the route
  const handleAddShop = () => {
    if (selectedShop) {
      const shop:ShopType|undefined = allShops.find((shop:ShopType) => shop.name === selectedShop);
      if (shop && !shopsInRoute.some((s:ShopRouteType) => s.shop_name === shop.name)) {
        setShopsInRoute((prev) => [...prev, { shop_name: shop.name, order: prev.length + 1, route_name: routeName }]);
      } else {
        toast.error("Shop is already in the route");
      }
    }
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(shopsInRoute);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update the order field
    reordered.forEach((shop, index) => {
      shop.order = index + 1;
    });

    setShopsInRoute(reordered);
  };

  // Save the updated order
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.put(`/api/route/shops?routeName=${routeName}`, { shops: shopsInRoute }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Route updated successfully!");
      router.push("/admin/routes"); // Redirect to routes page
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Shops in Route: {routeName}</h1>

      {/* Add Shop */}
      <div className="flex items-center gap-4 mb-6">
        <Select onValueChange={(value) => setSelectedShop(value)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a shop" />
          </SelectTrigger>
          <SelectContent>
            {allShops.map((shop) => (
              <SelectItem key={shop.name} value={shop.name}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddShop}>Add Shop</Button>
      </div>

      {/* Drag-and-Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="shops">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {shopsInRoute.map((shop, index) => (
                <Draggable key={shop.shop_name} draggableId={shop.shop_name} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-4 bg-gray-100 rounded-md flex justify-between items-center"
                    >
                      <span>{shop.shop_name}</span>
                      <span>Order: {shop.order}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Save Button */}
      <div className="mt-6">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
