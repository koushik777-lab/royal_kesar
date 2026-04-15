import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  useGetStoreSummary, 
  useListOrders, 
  useUpdateOrderStatus, 
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListUsers,
  getGetStoreSummaryQueryKey, 
  getListOrdersQueryKey,
  getListProductsQueryKey,
  getListUsersQueryKey,
  useListCategories
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  LayoutDashboard, 
  PackagePlus, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { UpdateOrderStatusBodyStatus, CreateProductBody } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// --- Sub-components ---

type AdminTab = "dashboard" | "products" | "customers" | "orders";

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  expanded: boolean;
}

function SidebarItem({ icon: Icon, label, active, onClick, expanded }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
        active 
          ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
      }`}
    >
      <Icon size={20} className={active ? "text-primary" : "group-hover:text-primary transition-colors"} />
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// --- Main Views ---

function DashboardView({ summary, summaryLoading, orders, ordersLoading, onStatusChange }: any) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'shipped': return <Truck size={14} className="text-purple-500" />;
      case 'delivered': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card/50 animate-pulse border border-primary/10 rounded-xl"></div>)
        ) : summary ? (
          <>
            <Card className="glass-panel border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="w-4 h-4 text-primary" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif text-gradient-gold">₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            <Card className="glass-panel border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Orders</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg"><ShoppingBag className="w-4 h-4 text-primary" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif text-foreground">{summary.totalOrders}</div>
              </CardContent>
            </Card>
            <Card className="glass-panel border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Products</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-4 h-4 text-primary" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif text-foreground">{summary.totalProducts}</div>
              </CardContent>
            </Card>
            <Card className="glass-panel border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customers</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-4 h-4 text-primary" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif text-foreground">{summary.totalUsers}</div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Table */}
        <Card className="lg:col-span-2 glass-panel border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10 pb-4">
            <CardTitle className="font-serif text-xl">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="border-primary/10">
                    <TableHead className="text-xs uppercase tracking-widest text-muted-foreground px-6">Order ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-muted-foreground px-6">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-muted-foreground px-6">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-muted-foreground px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell></TableRow>
                  ) : orders?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No orders found.</TableCell></TableRow>
                  ) : orders?.map((order: any) => (
                    <TableRow key={order.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="px-6 font-mono text-primary text-xs">RKC-{order.id.toString().padStart(6, '0')}</TableCell>
                      <TableCell className="px-6">
                        <div className="font-medium text-sm">{order.userName}</div>
                        <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                      </TableCell>
                      <TableCell className="px-6 font-serif text-sm">₹{order.total.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="px-6">
                        <Select 
                          defaultValue={order.status} 
                          onValueChange={(val) => onStatusChange(order.id, val as UpdateOrderStatusBodyStatus)}
                        >
                          <SelectTrigger className="h-8 border-primary/20 bg-background/50 rounded-lg w-[120px] text-[10px] uppercase font-bold tracking-wider">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-primary/20 bg-card/95 backdrop-blur-xl">
                            <SelectItem value="pending" className="text-xs uppercase font-bold text-yellow-500">Pending</SelectItem>
                            <SelectItem value="confirmed" className="text-xs uppercase font-bold text-blue-500">Confirmed</SelectItem>
                            <SelectItem value="shipped" className="text-xs uppercase font-bold text-purple-500">Shipped</SelectItem>
                            <SelectItem value="delivered" className="text-xs uppercase font-bold text-green-500">Delivered</SelectItem>
                            <SelectItem value="cancelled" className="text-xs uppercase font-bold text-red-500">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-1 glass-panel border-primary/10">
          <CardHeader className="border-b border-primary/10 pb-4">
            <CardTitle className="font-serif text-xl">Top Selling</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {summaryLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-background border border-primary/5 rounded-xl"></div>)}
              </div>
            ) : summary?.topProducts?.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No sales data yet.</p>
            ) : (
              <div className="space-y-4">
                {summary?.topProducts.map((p: any, i: number) => (
                  <div key={p.productId} className="flex justify-between items-center p-4 border border-primary/10 bg-background/30 rounded-xl hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-primary text-xl font-bold italic w-4 opacity-50 group-hover:opacity-100">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground line-clamp-1">{p.productName}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary">
                      {p.totalSold} sold
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductsView() {
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<CreateProductBody>>({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    weight: "",
    imageUrl: "",
    images: [],
    stock: 0,
    featured: false
  });

  useEffect(() => {
    if (categories && categories.length > 0 && formData.categoryId === 0) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate slug if not present
      const submissionData = {
        ...formData,
        slug: formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ""
      };

      // If primary imageUrl is empty but we have uploaded images, set first one as primary
      if (!submissionData.imageUrl && submissionData.images && submissionData.images.length > 0) {
        submissionData.imageUrl = submissionData.images[0];
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({ 
          id: editingProduct.id, 
          data: submissionData as CreateProductBody 
        });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync({ data: submissionData as CreateProductBody });
        toast({ title: "Product created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ 
        title: "Operation failed", 
        description: error.response?.data?.error || error.message || "Failed to save product",
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: categories?.[0]?.id || 0,
      weight: "",
      imageUrl: "",
      images: [],
      stock: 0,
      featured: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      weight: product.weight,
      imageUrl: product.imageUrl,
      images: product.images || [],
      stock: product.stock,
      featured: product.featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: "Product deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-foreground">Royal Collection</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={18} className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Premium Kashmiri Saffron" 
                    className="bg-background/50 border-primary/10"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.categoryId?.toString()} onValueChange={val => setFormData({...formData, categoryId: parseInt(val)})}>
                    <SelectTrigger className="bg-background/50 border-primary/10"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="bg-card border-primary/20">
                      {categories?.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                    className="bg-background/50 border-primary/10"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight / Size</Label>
                  <Input 
                    value={formData.weight} 
                    onChange={e => setFormData({...formData, weight: e.target.value})} 
                    placeholder="e.g. 1g, 500g" 
                    className="bg-background/50 border-primary/10"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="bg-background/50 border-primary/10"
                    rows={3} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    placeholder="https://..." 
                    className="bg-background/50 border-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input 
                    type="number" 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                    className="bg-background/50 border-primary/10"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Additional Images</Label>
                  <div className="space-y-4">
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const base64Images = await Promise.all(
                          files.map(file => new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                          }))
                        );
                        setFormData({
                          ...formData, 
                          images: [...(formData.images || []), ...base64Images]
                        });
                      }}
                      className="bg-background/50 border-primary/10 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images?.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-primary/10">
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = [...(formData.images || [])];
                              newImages.splice(idx, 1);
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={e => setFormData({...formData, featured: e.target.checked})} 
                  className="rounded border-primary/20 text-primary bg-background/50" 
                  id="featured" 
                />
                <Label htmlFor="featured" className="cursor-pointer">Mark as Featured</Label>
              </div>
              <DialogFooter className="pt-6">
                <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">{editingProduct ? "Update Product" : "Save Product"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel border-primary/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-primary/10">
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Product</TableHead>
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Price</TableHead>
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Stock</TableHead>
              <TableHead className="px-6 text-right text-xs uppercase tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading products...</TableCell></TableRow>
            ) : products?.map(product => (
              <TableRow key={product.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10 shadow-inner">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package size={20} className="text-primary/40" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.weight}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  <Badge variant="outline" className="border-primary/10 bg-primary/5 text-muted-foreground font-normal text-[10px] uppercase">
                    {product.categoryName}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 font-serif text-sm">₹{product.price.toLocaleString('en-IN')}</TableCell>
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <span className={`text-sm ${product.stock && product.stock < 10 ? "text-red-500 font-bold" : "text-foreground"}`}>
                      {product.stock || 0}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">units</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-muted-foreground hover:text-primary h-8 w-8 hover:bg-primary/10"><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-muted-foreground hover:text-red-500 h-8 w-8 hover:bg-red-500/10"><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function CustomersView() {
  const { data: users, isLoading } = useListUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-foreground">Royal Patrons</h2>
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
          {users?.length || 0} Total Customers
        </Badge>
      </div>
      <Card className="glass-panel border-primary/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-primary/10">
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Customer</TableHead>
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Email Address</TableHead>
              <TableHead className="px-6 text-xs uppercase tracking-widest text-muted-foreground">Registration</TableHead>
              <TableHead className="px-6 text-right text-xs uppercase tracking-widest text-muted-foreground">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Loading patron database...</span>
                </div>
              </TableCell></TableRow>
            ) : users?.map(user => (
              <TableRow key={user.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                      {user.name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 text-muted-foreground text-sm">{user.email}</TableCell>
                <TableCell className="px-6 text-muted-foreground text-xs uppercase tracking-wider">
                  {format(new Date(), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Badge variant="outline" className={user.role === 'admin' 
                    ? "bg-primary/10 text-primary border-primary/20 font-bold px-3" 
                    : "text-muted-foreground font-normal"}>
                    {user.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function OrdersView({ orders, ordersLoading, onStatusChange }: any) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'shipped': return <Truck size={14} className="text-purple-500" />;
      case 'delivered': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-foreground">Order Management</h2>
        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
          {orders?.length || 0} Total Orders
        </Badge>
      </div>

      <div className="space-y-6">
        {ordersLoading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
              <span className="text-sm text-muted-foreground">Loading orders...</span>
            </div>
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No orders found.</div>
        ) : (
          orders?.map((order: any) => (
            <Card key={order.id} className="glass-panel border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
                <div>
                  <CardTitle className="font-serif text-xl text-primary mb-1">
                    Order RKC-{order.id.toString().padStart(6, '0')}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">
                    Placed on {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-background/80 rounded-lg px-4 py-2 border border-primary/10 text-right flex-1 md:flex-none">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Amount</div>
                    <div className="font-serif text-lg font-bold">₹{order.total.toLocaleString('en-IN')}</div>
                  </div>
                  <Select 
                    defaultValue={order.status} 
                    onValueChange={(val) => onStatusChange(order.id, val as UpdateOrderStatusBodyStatus)}
                  >
                    <SelectTrigger className="h-12 border-primary/20 bg-background/50 rounded-lg w-[140px] text-[11px] uppercase font-bold tracking-wider">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/20 bg-card/95 backdrop-blur-xl">
                      <SelectItem value="pending" className="text-[10px] uppercase font-bold text-yellow-500">Pending</SelectItem>
                      <SelectItem value="confirmed" className="text-[10px] uppercase font-bold text-blue-500">Confirmed</SelectItem>
                      <SelectItem value="shipped" className="text-[10px] uppercase font-bold text-purple-500">Shipped</SelectItem>
                      <SelectItem value="delivered" className="text-[10px] uppercase font-bold text-green-500">Delivered</SelectItem>
                      <SelectItem value="cancelled" className="text-[10px] uppercase font-bold text-red-500">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer Details */}
                  <div>
                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Customer & Checkout Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Full Name:</span>
                        <span className="col-span-2 font-medium">{order.userName || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Email:</span>
                        <span className="col-span-2">{order.userEmail || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Phone:</span>
                        <span className="col-span-2">{order.phone || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Address:</span>
                        <span className="col-span-2 leading-relaxed">{order.shippingAddress || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-primary/5">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider items-center flex">Payment:</span>
                        <div className="col-span-2">
                          <span className="uppercase text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded inline-block border border-primary/20">
                            {order.paymentMethod || "N/A"}
                          </span>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-muted-foreground text-xs uppercase tracking-wider">Notes:</span>
                          <span className="col-span-2 italic text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs">
                            {order.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Order Items</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-background/30 p-2 rounded-lg border border-primary/5">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : <Package size={16} className="text-primary/40" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.productName}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Qty: <span className="text-foreground">{item.quantity}</span> × ₹{item.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="font-serif font-bold text-sm shrink-0 text-primary">
                            ₹{item.subtotal.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const { data: summary, isLoading: summaryLoading } = useGetStoreSummary({
    query: {
      queryKey: getGetStoreSummaryQueryKey(),
      enabled: isAdmin
    }
  });

  const { data: orders, isLoading: ordersLoading } = useListOrders({
    query: {
      queryKey: getListOrdersQueryKey(),
      enabled: isAdmin
    }
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

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/admin/login");
    } catch (e) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[#050505] text-foreground font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {!isExpanded && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden pointer-events-none opacity-0"></div>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 280 : 80 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-[#0a0a0a] border-r border-primary/10 flex flex-col transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.4)]"
      >
        <div className="p-6 flex items-center justify-between mb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <span className="font-serif text-lg font-bold tracking-widest text-gradient-gold uppercase truncate">ROYAL KESAR</span>
                <span className="text-[8px] tracking-[0.3em] text-muted-foreground uppercase opacity-70">Control Panel</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 ml-2"
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            expanded={isExpanded} 
          />
          <SidebarItem 
            icon={ClipboardList} 
            label="Orders" 
            active={activeTab === "orders"} 
            onClick={() => setActiveTab("orders")} 
            expanded={isExpanded} 
          />
          <SidebarItem 
            icon={PackagePlus} 
            label="Add Products" 
            active={activeTab === "products"} 
            onClick={() => setActiveTab("products")} 
            expanded={isExpanded} 
          />
          <SidebarItem 
            icon={Users} 
            label="Customers" 
            active={activeTab === "customers"} 
            onClick={() => setActiveTab("customers")} 
            expanded={isExpanded} 
          />
        </nav>

        <div className="p-4 mt-auto border-t border-primary/5 bg-gradient-to-t from-primary/5 to-transparent">
          <SidebarItem 
            icon={LogOut} 
            label="Logout" 
            active={false} 
            onClick={handleLogout} 
            expanded={isExpanded} 
          />
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{ paddingLeft: isExpanded ? 280 : 80 }}
        className="flex-1 w-full min-h-screen transition-all duration-300 overflow-y-auto bg-pattern-kashmiri"
      >
        {/* Top Navigation / Header */}
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-primary/10 px-8 py-6 flex items-center justify-between backdrop-blur-md">
          <div>
            <h1 className="font-serif text-2xl text-foreground capitalize tracking-wide">{activeTab}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
              Royal Management <span className="mx-2 text-primary/30">|</span> <span className="text-primary font-medium tracking-normal normal-case">Logged in as {user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search resources..." 
                className="pl-9 h-9 w-[200px] lg:w-[350px] border-primary/10 bg-background/30 rounded-full text-xs transition-all focus:w-[400px] border-focus:border-primary/40 shadow-inner" 
              />
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">{user?.name}</div>
                <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Admin</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-[1px] shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                <div className="w-full h-full rounded-2xl bg-[#0a0a0a] flex items-center justify-center text-primary font-bold text-lg">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* View Layout Container */}
        <div className="p-8 pb-16 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === "dashboard" && (
                <DashboardView 
                  summary={summary} 
                  summaryLoading={summaryLoading} 
                  orders={orders} 
                  ordersLoading={ordersLoading} 
                  onStatusChange={handleStatusChange} 
                />
              )}
              {activeTab === "orders" && (
                <OrdersView 
                  orders={orders} 
                  ordersLoading={ordersLoading} 
                  onStatusChange={handleStatusChange} 
                />
              )}
              {activeTab === "products" && <ProductsView />}
              {activeTab === "customers" && <CustomersView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
