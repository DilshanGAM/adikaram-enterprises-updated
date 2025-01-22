"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AdminRoutePage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null); // For editing/deleting
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    distance: "",
  });

  // Fetch routes from the API
  useEffect(() => {
    const fetchRoutes = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/route", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoutes(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch routes");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) fetchRoutes();
  }, [isLoading]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding or editing a route
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      if (selectedRoute) {
        // Update route
        await axios.put(`/api/route?name=${selectedRoute.name}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Route updated successfully!");
      } else {
        // Add new route
        await axios.post("/api/route", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Route added successfully!");
      }
      setIsAddEditModalOpen(false);
      setIsLoading(true); // Refresh the routes
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save route");
    }
  };

  // Handle deleting a route
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/route?name=${selectedRoute.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Route deleted successfully!");
      setIsConfirmationOpen(false);
      setIsLoading(true); // Refresh the routes
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete route");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Route Management</h1>

      {/* Loading Message */}
      {isLoading ? (
        <div className="text-center text-lg font-medium text-gray-700">
          Loading, please wait...
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => setIsAddEditModalOpen(true)}>Add Route</Button>
          </div>

          {/* Routes Table */}
          <div className="overflow-auto">
            <Table>
              <TableCaption>A list of all routes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length > 0 ? (
                  routes.map((route: any) => (
                    <TableRow key={route.name}>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>{route.description}</TableCell>
                      <TableCell>{route.distance}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRoute(route);
                              setFormData(route);
                              setIsAddEditModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRoute(route);
                              setIsConfirmationOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                          <Link href={`/admin/shops-arrange?routeName=${route.name}`}>
                            <Button size="sm">Manage Shops</Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No routes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoute ? "Edit Route" : "Add Route"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Route Name"
              required
              disabled={!!selectedRoute} // Disable name editing for existing routes
            />
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Route Description"
            />
            <Input
              name="distance"
              type="number"
              value={formData.distance}
              onChange={handleChange}
              placeholder="Distance (e.g., in kilometers)"
              required
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddEditModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>{selectedRoute ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the route "{selectedRoute?.name}"?</p>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
