import { Layout } from "@/components/layout/layout";
import { useGetCart, useRemoveFromCart, useUpdateCartItem } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: cart, isLoading } = useGetCart({
    query: {
      enabled: isAuthenticated,
    }
  });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateItem.mutateAsync({ id: productId, data: { quantity } });
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  const handleRemove = async (productId: number) => {
    await removeItem.mutateAsync({ id: productId });
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  if (!isAuthenticated) return null;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <Layout>
      <div className="bg-card border-b border-primary/10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Your Cart</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto uppercase tracking-widest text-sm">
            Review your selection
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-24 glass-panel border border-primary/10 max-w-2xl mx-auto">
            <ShoppingBag size={48} className="mx-auto text-primary/40 mb-6" />
            <h3 className="font-serif text-2xl text-foreground mb-4">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8">Discover our collection of premium Kashmiri products.</p>
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 h-12 uppercase tracking-widest text-sm">
                Explore Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-primary/20 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-primary/10">
                  <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                    <div className="w-24 h-24 bg-card border border-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-primary/30">RKC</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-serif text-lg text-foreground hover:text-primary transition-colors">
                        {item.productName}
                      </Link>
                      <button 
                        onClick={() => handleRemove(item.productId)}
                        className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs uppercase tracking-widest mt-3 transition-colors"
                        disabled={removeItem.isPending}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 text-left md:text-center text-primary font-serif">
                    <span className="md:hidden text-muted-foreground text-sm mr-2 font-sans">Price:</span>
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-primary/30 bg-card h-10 w-28 justify-between px-2">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="text-muted-foreground hover:text-primary p-1"
                        disabled={item.quantity <= 1 || updateItem.isPending}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-medium text-foreground text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="text-muted-foreground hover:text-primary p-1"
                        disabled={updateItem.isPending}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 text-left md:text-right font-serif text-lg text-foreground">
                    <span className="md:hidden text-muted-foreground text-sm mr-2 font-sans">Total:</span>
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="glass-panel p-8 border border-primary/20 sticky top-32">
                <h3 className="font-serif text-2xl text-foreground mb-6 pb-4 border-b border-primary/10">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-serif">₹{cart?.total?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary text-sm uppercase tracking-widest mt-1">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-primary/20 pt-6 mb-8 flex justify-between items-center">
                  <span className="font-medium text-foreground uppercase tracking-widest">Total</span>
                  <span className="font-serif text-3xl text-gradient-gold">₹{cart?.total?.toLocaleString('en-IN')}</span>
                </div>
                
                <Link href="/checkout">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-14 uppercase tracking-widest text-sm">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary" /> Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { ShieldCheck } from "lucide-react";
