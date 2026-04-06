import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useListOrders, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Package, User as UserIcon, Settings, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function Account() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: orders, isLoading: ordersLoading } = useListOrders({
    query: { enabled: isAuthenticated }
  });

  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Profile updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "confirmed": return "text-blue-500 border-blue-500/20 bg-blue-500/10";
      case "shipped": return "text-purple-500 border-purple-500/20 bg-purple-500/10";
      case "delivered": return "text-green-500 border-green-500/20 bg-green-500/10";
      case "cancelled": return "text-destructive border-destructive/20 bg-destructive/10";
      default: return "text-muted-foreground border-muted/20 bg-muted/10";
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <Layout>
      <div className="bg-card border-b border-primary/10 pt-32 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl text-foreground mb-2">My Account</h1>
          <p className="text-primary font-serif">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-3 space-y-2">
            <button 
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between p-4 border text-sm transition-colors ${activeTab === "orders" ? "bg-primary/10 border-primary text-primary" : "bg-card border-primary/10 text-foreground hover:bg-primary/5"}`}
            >
              <div className="flex items-center gap-3">
                <Package size={18} /> Orders
              </div>
              <ChevronRight size={16} className={activeTab === "orders" ? "opacity-100" : "opacity-0"} />
            </button>
            
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between p-4 border text-sm transition-colors ${activeTab === "profile" ? "bg-primary/10 border-primary text-primary" : "bg-card border-primary/10 text-foreground hover:bg-primary/5"}`}
            >
              <div className="flex items-center gap-3">
                <UserIcon size={18} /> Profile Settings
              </div>
              <ChevronRight size={16} className={activeTab === "profile" ? "opacity-100" : "opacity-0"} />
            </button>
            
            {user.role === 'admin' && (
              <Link href="/admin" className="w-full flex items-center justify-between p-4 border bg-card border-primary/10 text-foreground hover:bg-primary/5 text-sm transition-colors">
                <div className="flex items-center gap-3">
                  <Settings size={18} /> Admin Panel
                </div>
              </Link>
            )}

            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 p-4 border bg-card border-primary/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 text-sm transition-colors mt-8"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="md:col-span-9">
            
            {activeTab === "orders" && (
              <div className="glass-panel p-8 border border-primary/20 min-h-[500px]">
                <h2 className="font-serif text-2xl text-foreground mb-8 pb-4 border-b border-primary/10">Order History</h2>
                
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-card border border-primary/10 animate-pulse"></div>
                    ))}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={48} className="mx-auto text-primary/20 mb-4" />
                    <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                    <Link href="/products">
                      <Button className="bg-primary text-primary-foreground rounded-none uppercase tracking-widest text-xs">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-primary/20 bg-card p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b border-primary/10 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Order Placed</span>
                            <span className="font-medium text-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Total</span>
                            <span className="font-serif text-primary text-lg">₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Order #</span>
                            <span className="font-mono text-foreground">RKC-{order.id.toString().padStart(6, '0')}</span>
                          </div>
                          <div className="sm:text-right">
                            <span className={`px-3 py-1 text-xs uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-background border border-primary/10 flex-shrink-0">
                                {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-foreground">{item.productName}</h4>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="glass-panel p-8 border border-primary/20">
                <h2 className="font-serif text-2xl text-foreground mb-8 pb-4 border-b border-primary/10">Profile Settings</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                    <div className="space-y-2 mb-6">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">Email Address</label>
                      <Input value={user.email} disabled className="bg-background/20 border-primary/10 opacity-70 rounded-none h-12" />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">Full Name</FormLabel>
                          <FormControl>
                            <Input className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">Phone Number</FormLabel>
                          <FormControl>
                            <Input className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">Default Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none min-h-[100px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-none uppercase tracking-widest text-xs mt-4"
                    >
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </Layout>
  );
}
