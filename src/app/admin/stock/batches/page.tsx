"use client";

import axios from "axios";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BatchForm from "@/components/ui/add-batch-form";
import { BatchType } from "@/types/user";

export default function BatchAdminPage() {
  const [batches, setBatches] = useState<BatchType[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<BatchType[]>([]);
  const [search, setSearch] = useState("");
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null); // For editing batches

  // Fetch batches from the API
  useEffect(() => {
    const fetchBatches = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/batches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBatches(res.data.batches);
        setFilteredBatches(res.data.batches);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch batches");
      } finally {
        setBatchesLoading(false);
      }
    };

    if (batchesLoading) fetchBatches();
  }, [batchesLoading]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const filtered = batches.filter(
      (batch) =>
        batch.batch_id.toString().includes(e.target.value) ||
        batch.product_key.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredBatches(filtered);
  };

  // Open modal for adding a new batch
  const handleAddBatch = () => {
    setSelectedBatch(null); // No batch selected for adding
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing an existing batch
  const handleEditBatch = (batch: BatchType) => {
    setSelectedBatch(batch); // Set the batch to be edited
    setIsAddEditModalOpen(true);
  };

  // Close modal and refresh the batch list
  const handleModalClose = () => {
    setIsAddEditModalOpen(false);
    setBatchesLoading(true); // Refresh batches after adding/editing
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Batch Management</h1>

      {/* Loading Message */}
      {batchesLoading ? (
        <div className="text-center text-lg font-medium text-gray-700">
          Loading, please wait...
        </div>
      ) : (
        <>
          {/* Search and Actions */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by batch ID or product key"
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
            <Button onClick={() => setBatchesLoading(true)}>Refresh</Button>
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddBatch}>Add Batch</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedBatch ? "Edit Batch" : "Add Batch"}
                  </DialogTitle>
                </DialogHeader>
                <BatchForm
                  batch={selectedBatch}
                  onSuccess={handleModalClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Batch Table */}
          <div className="overflow-auto">
            <Table>
              <TableCaption>A list of all batches in stock.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Product Key</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Packs</TableHead>
                  <TableHead>Loose</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>MFD</TableHead>
                  <TableHead>EXP</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((batch) => (
                    <TableRow key={batch.batch_id}>
                      <TableCell>{batch.batch_id}</TableCell>
                      <TableCell>{batch.product_key}</TableCell>
                      <TableCell>{batch.uom}</TableCell>
                      <TableCell>{batch.packs}</TableCell>
                      <TableCell>{batch.loose}</TableCell>
                      <TableCell>{batch.packs * batch.uom + batch.loose}</TableCell>
                      <TableCell>{batch.remaining}</TableCell>
                      <TableCell>{new Date(batch.mfd).toDateString()}</TableCell>
                      <TableCell>{new Date(batch.exp).toDateString()}</TableCell>
                      <TableCell>{batch.cost}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBatch(batch)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No batches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
