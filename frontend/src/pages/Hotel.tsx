import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listHotels, useAdminDeleteHotel, useAdminCreateHotel, useAdminUpdateHotel, Hotel } from "@workspace/api-client-react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Plus, Loader2, Star, MapPin, Pencil } from "lucide-react";

const emptyForm = {
  name: "", city: "", state: "", location: "",
  description: "", imageUrl: "", rating: 4, amenities: "WiFi,AC,Room Service",
  minPrice: 5000, featured: false,
};

export default function AdminHotels() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editHotel, setEditHotel] = useState<Hotel | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotels, isLoading } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: () => listHotels(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });

  const deleteMutation = useAdminDeleteHotel({
    mutation: {
      onSuccess: () => { toast({ title: "Hotel deleted" }); invalidate(); },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const createMutation = useAdminCreateHotel({
    mutation: {
      onSuccess: () => {
        toast({ title: "Hotel created!" });
        invalidate();
        closeForm();
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const updateMutation = useAdminUpdateHotel({
    mutation: {
      onSuccess: () => {
        toast({ title: "Hotel updated!" });
        invalidate();
        closeForm();
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const openAdd = () => { setEditHotel(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (h: Hotel) => {
    setEditHotel(h);
    setForm({
      name: h.name, city: h.city, state: h.state ?? "", location: h.location ?? "",
      description: h.description ?? "", imageUrl: h.imageUrl ?? "",
      rating: h.rating ?? 4, amenities: h.amenities ?? "",
      minPrice: h.minPrice ?? 5000, featured: h.featured ?? false,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditHotel(null); setForm({ ...emptyForm }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editHotel) {
      updateMutation.mutate({ id: editHotel.id, data: form });
    } else {
      createMutation.mutate({ data: form });
    }
  };

  const filtered = (hotels ?? []).filter((h: Hotel) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Hotel Management">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Hotels", value: hotels?.length ?? 0, color: "text-purple-600" },
          { label: "Featured", value: hotels?.filter((h: Hotel) => h.featured).length ?? 0, color: "text-amber-600" },
          { label: "Cities", value: new Set(hotels?.map((h: Hotel) => h.city)).size ?? 0, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search hotels..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Button onClick={openAdd} className="bg-[hsl(222,47%,15%)] text-white h-9 text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Hotel
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Hotel</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Location</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Rating</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Min Price</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((h: Hotel, idx: number) => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {h.imageUrl
                          ? <img src={h.imageUrl} alt={h.name} className="w-10 h-10 rounded-lg object-cover" />
                          : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">IMG</div>
                        }
                        <div>
                          <p className="font-medium text-gray-900">{h.name}</p>
                          {h.featured && <span className="text-xs text-amber-600 font-medium">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-1 text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400" />{h.city}{h.state ? `, ${h.state}` : ""}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{h.rating ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-amber-600">
                      {h.minPrice ? `₹${h.minPrice.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-500 hover:bg-blue-50" onClick={() => openEdit(h)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-red-500 hover:bg-red-50"
                          onClick={() => { if (window.confirm(`Delete "${h.name}"?`)) deleteMutation.mutate({ id: h.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No hotels found</div>}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {editHotel ? "Edit Hotel" : "Add New Hotel"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Hotel Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Grand Hyatt Mumbai" />
              </div>
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="Mumbai" />
              </div>
              <div className="space-y-1.5">
                <Label>State *</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required placeholder="Maharashtra" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Location / Address</Label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Nariman Point, Mumbai" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Rating (1–5)</Label>
                <Input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Min Price (₹)</Label>
                <Input type="number" min={500} value={form.minPrice} onChange={e => setForm({ ...form, minPrice: parseInt(e.target.value) })} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Amenities (comma-separated)</Label>
                <Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi,Pool,Spa,Gym" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <Label htmlFor="featured" className="cursor-pointer">Mark as Featured Hotel</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-[hsl(222,47%,15%)] text-white" disabled={isPending}>
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editHotel ? "Updating..." : "Creating..."}</> : editHotel ? "Update Hotel" : "Create Hotel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
