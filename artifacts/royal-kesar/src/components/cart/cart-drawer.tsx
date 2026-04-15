import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetCart, useRemoveFromCart, useUpdateCartItem, useClearCart } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart({
    query: {
      enabled: isAuthenticated && open,
      queryKey: ["/api/cart"]
    }
  });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateItem.mutateAsync({ productId, data: { quantity } });
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  const handleRemove = async (productId: number) => {
    await removeItem.mutateAsync({ productId });
    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
  };

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-primary/20 p-0 flex flex-col">
        <div className="p-6 border-b border-primary/10">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl text-primary flex items-center gap-2">
              <ShoppingBag /> Your Cart
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag size={32} />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">Sign in to view cart</h3>
                <p className="text-muted-foreground text-sm">Log in or create an account to manage your shopping cart.</p>
              </div>
              <Link href="/login" onClick={() => onOpenChange(false)}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-20 h-20 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag size={32} />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-sm">Discover our collection of premium Kashmiri products.</p>
              </div>
              <Link href="/products" onClick={() => onOpenChange(false)}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8">
                  Explore Collection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 border border-primary/10">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40 font-serif text-xs uppercase">RKC</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{item.productName}</h4>
                    <p className="text-primary font-serif mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-primary/20 rounded-sm">
                        <button 
                          className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs w-6 text-center">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updateItem.isPending}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        onClick={() => handleRemove(item.productId)}
                        disabled={removeItem.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">₹{item.subtotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEmpty && isAuthenticated && (
          <div className="p-6 border-t border-primary/10 bg-card">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cart?.total?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Calculated at checkout</span>
              </div>
              <div className="pt-3 border-t border-primary/10 flex justify-between font-serif text-lg text-primary">
                <span>Total</span>
                <span>₹{cart?.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <Link href="/checkout" onClick={() => onOpenChange(false)}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 text-sm tracking-widest uppercase">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
