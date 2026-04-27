import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@workspace/api-client-react";
import AdminLayout from "@/components/admin-layout";
import { Users, Hotel, BookOpen, TrendingUp, Loader2, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
  });

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Total Hotels", value: stats?.totalHotels ?? 0, icon: Hotel, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Total Revenue", value: `₹${((stats?.totalRevenue ?? 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-border p-6">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(222,47%,15%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Bookings */}
          {stats?.recentBookings && stats.recentBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-gray-400 font-medium">Booking ID</th>
                      <th className="text-left pb-3 text-gray-400 font-medium">Guest</th>
                      <th className="text-left pb-3 text-gray-400 font-medium">Hotel</th>
                      <th className="text-left pb-3 text-gray-400 font-medium">Total</th>
                      <th className="text-left pb-3 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentBookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="py-3 font-mono text-xs text-gray-500">{b.bookingId}</td>
                        <td className="py-3">{b.user?.name ?? "-"}</td>
                        <td className="py-3 text-gray-600">{b.hotel?.name ?? "-"}</td>
                        <td className="py-3 font-semibold text-amber-600">₹{b.totalPrice.toLocaleString("en-IN")}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium rounded-full px-2 py-1 ${statusColors[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
