import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listHotels, getHotelRooms, useAdminDeleteRoom, useAdminCreateRoom, useAdminUpdateRoom } from "@workspace/api-client-react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Loader2, Pencil } from "lucide-react";

const emptyForm = {
  name: "", type: "Deluxe", description: "",
  price: 5000, capacity: 2, imageUrl: "", amenities: "WiFi,AC,TV", available: true,
};

export default function AdminRooms() {
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotels } = useQuery({ queryKey: ["hotels-list"], queryFn: () => listHotels() });
  const hotelId = selectedHotel !== "all" ? parseInt(selectedHotel) : undefined;
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["hotel-rooms", hotelId],
    queryFn: () => hotelId ? getHotelRooms(hotelId) : Promise.resolve([]),
    enabled: !!hotelId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hotel-rooms"] });

  const deleteMutation = useAdminDeleteRoom({
    mutation: {
      onSuccess: () => { toast({ title: "Room deleted" }); invalidate(); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    },
  });

  const createMutation = useAdminCreateRoom({
    mutation: {
      onSuccess: () => { toast({ title: "Room created!" }); invalidate(); closeForm(); },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const updateMutation = useAdminUpdateRoom({
    mutation: {
      onSuccess: () => { toast({ title: "Room updated!" }); invalidate(); closeForm(); },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const openAdd = () => { setEditRoom(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (r: any) => {
    setEditRoom(r);
    setForm({ name: r.name, type: r.type ?? "Deluxe", description: r.description ?? "", price: r.price, capacity: r.capacity, imageUrl: r.imageUrl ?? "", amenities: r.amenities ?? "", available: r.available ?? true });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditRoom(null); setForm({ ...emptyForm }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRoom) {
      updateMutation.mutate({ id: editRoom.id, data: form });
    } else {
      createMutation.mutate({ hotelId: hotelId!, data: { ...form, hotelId: hotelId! } });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Room Management">
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <Select value={selectedHotel} onValueChange={setSelectedHotel}>
            <SelectTrigger className="h-9 w-80 text-sm">
              <SelectValue placeholder="Select a hotel to manage rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">— Select a Hotel —</SelectItem>
              {hotels?.map((h: any) => (
                <SelectItem key={h.id} value={String(h.id)}>{h.name} — {h.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            {hotelId && (
              <span className="text-sm text-gray-500">{rooms?.length ?? 0} rooms</span>
            )}
            <Button onClick={openAdd} className="bg-[hsl(222,47%,15%)] text-white h-9 text-sm" disabled={!hotelId}>
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
          </div>
        </div>

        {!hotelId ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-1">Select a hotel</p>
            <p className="text-sm">Choose a hotel from the dropdown to manage its rooms</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Room</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Price/Night</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Capacity</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms?.map((r: any, idx: number) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {r.imageUrl
                          ? <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                          : <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                        }
                        <div>
                          <p className="font-medium text-gray-900">{r.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-40">{r.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge variant="outline" className="text-xs">{r.type}</Badge></td>
                    <td className="px-5 py-3 font-semibold text-amber-600">₹{r.price?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-gray-600">{r.capacity} guests</td>
                    <td className="px-5 py-3">
                      <Badge className={r.available ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}>
                        {r.available ? "Available" : "Unavailable"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-500 hover:bg-blue-50" onClick={() => openEdit(r)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-red-500 hover:bg-red-50"
                          onClick={() => { if (window.confirm(`Delete "${r.name}"?`)) deleteMutation.mutate({ id: r.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rooms?.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No rooms for this hotel</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {editRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Room Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Deluxe Ocean View" />
              </div>
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacity (guests) *</Label>
                <Input type="number" min={1} max={10} value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Price per Night (₹) *</Label>
                <Input type="number" min={500} value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) })} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Amenities (comma-separated)</Label>
                <Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi,AC,TV,Minibar" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="available" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <Label htmlFor="available" className="cursor-pointer">Room is Available</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-[hsl(222,47%,15%)] text-white" disabled={isPending}>
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editRoom ? "Updating..." : "Creating..."}</> : editRoom ? "Update Room" : "Create Room"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
