import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListBookings, useAdminUpdateBookingStatus, useAdminDeleteBooking } from "@workspace/api-client-react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, MapPin, Eye, Trash2, Calendar, Users, CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};
const paymentColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-500",
};

export default function AdminBookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewBooking, setViewBooking] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminListBookings(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });

  const updateMutation = useAdminUpdateBookingStatus({
    mutation: {
      onSuccess: () => { toast({ title: "Status updated" }); invalidate(); },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const deleteMutation = useAdminDeleteBooking({
    mutation: {
      onSuccess: () => { toast({ title: "Booking cancelled" }); invalidate(); },
      onError: (err: any) => toast({ title: "Failed", description: err?.response?.data?.error ?? "Error", variant: "destructive" }),
    },
  });

  const filtered = (bookings ?? []).filter((b: any) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b.bookingId?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.hotel?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.filter((b: any) => b.paymentStatus === "PAID").reduce((s: number, b: any) => s + (b.totalPrice ?? 0), 0);

  return (
    <AdminLayout title="Booking Management">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: filtered.length, color: "text-blue-600" },
          { label: "Confirmed", value: filtered.filter((b: any) => b.status === "CONFIRMED").length, color: "text-green-600" },
          { label: "Pending", value: filtered.filter((b: any) => b.status === "PENDING").length, color: "text-amber-600" },
          { label: "Revenue (Paid)", value: `₹${(totalRevenue / 100000).toFixed(2)}L`, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by ID, guest, hotel..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Booking ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Guest</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Hotel / Room</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Dates</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Update</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingId}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.user?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{b.hotel?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{b.room?.name}</p>
                      {b.hotel?.city && <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{b.hotel.city}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {b.checkIn ? new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} →{" "}
                      {b.checkOut ? new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-amber-600">₹{b.totalPrice?.toLocaleString("en-IN")}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${paymentColors[b.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusColors[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={b.status} onValueChange={status => updateMutation.mutate({ id: b.id, data: { status } })}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirm</SelectItem>
                          <SelectItem value="COMPLETED">Complete</SelectItem>
                          <SelectItem value="CANCELLED">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-500 hover:bg-blue-50" onClick={() => setViewBooking(b)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-red-500 hover:bg-red-50"
                          onClick={() => { if (window.confirm(`Cancel booking ${b.bookingId}?`)) deleteMutation.mutate({ id: b.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No bookings found</div>}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>Booking Details</DialogTitle>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-bold text-amber-600">{viewBooking.bookingId}</p>
                <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusColors[viewBooking.status] ?? "bg-gray-100 text-gray-600"}`}>{viewBooking.status}</span>
              </div>
              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                {[
                  { icon: Users, label: "Guest", value: `${viewBooking.user?.name ?? "—"} (${viewBooking.user?.email ?? ""})` },
                  { icon: MapPin, label: "Hotel", value: `${viewBooking.hotel?.name ?? "—"}, ${viewBooking.hotel?.city ?? ""}` },
                  { icon: MapPin, label: "Room", value: viewBooking.room?.name ?? "—" },
                  { icon: Calendar, label: "Check-In", value: viewBooking.checkIn ? new Date(viewBooking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { icon: Calendar, label: "Check-Out", value: viewBooking.checkOut ? new Date(viewBooking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { icon: Users, label: "Guests", value: `${viewBooking.guests} guest(s)` },
                  { icon: CreditCard, label: "Total Amount", value: `₹${viewBooking.totalPrice?.toLocaleString("en-IN")}` },
                  { icon: CreditCard, label: "Payment", value: viewBooking.paymentStatus },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-200 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={viewBooking.status} onValueChange={status => {
                  updateMutation.mutate({ id: viewBooking.id, data: { status } });
                  setViewBooking({ ...viewBooking, status });
                }}>
                  <SelectTrigger className="flex-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" className="h-9 px-3" onClick={() => {
                  if (window.confirm(`Cancel booking ${viewBooking.bookingId}?`)) {
                    deleteMutation.mutate({ id: viewBooking.id });
                    setViewBooking(null);
                  }
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
