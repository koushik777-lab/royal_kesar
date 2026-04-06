import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useGetStoreSummary, useListOrders, useUpdateOrderStatus, getGetStoreSummaryQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { UpdateOrderStatusBodyStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Admin() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const { data: summary, isLoading: summaryLoading } = useGetStoreSummary({
    query: { enabled: isAdmin }
  });

  const { data: orders, isLoading: ordersLoading } = useListOrders({
    query: { enabled: isAdmin }
  });

  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, status: UpdateOrderStatusBodyStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreSummaryQueryKey() });
      toast({ title: "Order status updated" });
    } catch (e) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="bg-card border-b border-primary/10 pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl text-primary mb-2">Royal Treasury Control</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm">Administrator Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Stats Row */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card animate-pulse border border-primary/10"></div>)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border-primary/20 rounded-none rounded-tl-xl rounded-br-xl glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-gradient-gold">₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/20 rounded-none glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
                <ShoppingBag className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-foreground">{summary.totalOrders}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/20 rounded-none glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Products</CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-foreground">{summary.totalProducts}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-primary/20 rounded-none rounded-tr-xl rounded-bl-xl glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Customers</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-foreground">{summary.totalUsers}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Orders Table */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl text-foreground pb-4 border-b border-primary/20">Recent Orders</h2>
            
            <div className="bg-card border border-primary/20 glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-primary/20 bg-background/50">
                    <tr>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase tracking-widest text-xs">Order ID</th>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase tracking-widest text-xs">Customer</th>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase tracking-widest text-xs">Date</th>
                      <th className="h-12 px-4 text-right font-medium text-muted-foreground uppercase tracking-widest text-xs">Amount</th>
                      <th className="h-12 px-4 text-left font-medium text-muted-foreground uppercase tracking-widest text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading orders...</td></tr>
                    ) : orders?.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No orders found.</td></tr>
                    ) : orders?.map((order) => (
                      <tr key={order.id} className="border-b border-primary/10 hover:bg-background/40 transition-colors">
                        <td className="p-4 font-mono text-primary">RKC-{order.id.toString().padStart(6, '0')}</td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">{order.userName}</div>
                          <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</td>
                        <td className="p-4 text-right font-serif text-foreground">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <Select 
                            defaultValue={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val as UpdateOrderStatusBodyStatus)}
                          >
                            <SelectTrigger className="h-8 border-primary/20 bg-background/50 rounded-none w-[130px] text-xs uppercase">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-primary/20 bg-card">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="font-serif text-2xl text-foreground pb-4 border-b border-primary/20">Top Selling</h2>
            <div className="bg-card border border-primary/20 glass-panel p-6">
              {summaryLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-background rounded-none border border-primary/10"></div>)}
                </div>
              ) : summary?.topProducts?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No sales data yet.</p>
              ) : (
                <div className="space-y-4">
                  {summary?.topProducts.map((p, i) => (
                    <div key={p.productId} className="flex justify-between items-center p-3 border border-primary/10 bg-background/30">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-primary text-xl font-bold w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-foreground line-clamp-1">{p.productName}</span>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-sm border border-primary/20">{p.totalSold} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
