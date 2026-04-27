import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListUsers, useAdminDeleteUser, User } from "@workspace/api-client-react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Eye, Loader2, ShieldCheck, Mail, Phone, Calendar, BookOpen } from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminListUsers(),
  });

  const deleteMutation = useAdminDeleteUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "User deleted successfully" });
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      },
      onError: (err: any) => {
        toast({ title: "Failed to delete", description: err?.response?.data?.error ?? "Error", variant: "destructive" });
      },
    },
  });

  const filtered = users?.filter((u: User) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const isAdmin = (u: User) =>
    u.role === "ADMIN" ||
    (Array.isArray(u.roles) && u.roles.some((r: any) => (typeof r === "string" ? r : r.name)?.includes("ADMIN")));

  return (
    <AdminLayout title="User Management">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users", value: users?.length ?? 0, color: "text-blue-600" },
          { label: "Admins", value: users?.filter(isAdmin).length ?? 0, color: "text-amber-600" },
          { label: "Regular Users", value: users?.filter((u: User) => !isAdmin(u)).length ?? 0, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{filtered.length} users</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user: User, idx: number) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[hsl(222,47%,15%)] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      {isAdmin(user) ? (
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 border border-gray-200">User</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-500 hover:bg-blue-50"
                          onClick={() => setViewUser(user)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!isAdmin(user) && (
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`))
                                deleteMutation.mutate({ id: user.id });
                            }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">No users found</div>}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[hsl(222,47%,15%)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {viewUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{viewUser.name}</p>
                  {isAdmin(viewUser) ? (
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border border-gray-200 mt-1">User</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                {[
                  { icon: Mail, label: "Email", value: viewUser.email },
                  { icon: Phone, label: "Phone", value: viewUser.phone ?? "Not provided" },
                  { icon: Calendar, label: "Joined", value: viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { icon: BookOpen, label: "User ID", value: `#${viewUser.id}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {!isAdmin(viewUser) && (
                <Button variant="destructive" className="w-full" onClick={() => {
                  if (window.confirm(`Delete user "${viewUser.name}"?`)) {
                    deleteMutation.mutate({ id: viewUser.id });
                    setViewUser(null);
                  }
                }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete User
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
