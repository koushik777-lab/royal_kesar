import { Layout } from "@/components/layout/layout";
import { useGetCart, useCreateOrder, useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Please provide a complete shipping address"),
  phone: z.string().min(10, "Please provide a valid phone number"),
  paymentMethod: z.enum(["online", "cod"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderComplete, setOrderComplete] = useState<{id: number, total: number} | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=/checkout");
    }
  }, [isAuthenticated, setLocation]);

  const { data: user } = useGetMe({
    query: { enabled: isAuthenticated }
  });

  const { data: cart, isLoading: isCartLoading } = useGetCart({
    query: { enabled: isAuthenticated && !orderComplete }
  });

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      phone: user?.phone || "",
      paymentMethod: "online",
      notes: "",
    },
  });

  // Update form defaults when user data loads
  useEffect(() => {
    if (user) {
      if (user.address && !form.getValues("shippingAddress")) form.setValue("shippingAddress", user.address);
      if (user.phone && !form.getValues("phone")) form.setValue("phone", user.phone);
    }
  }, [user, form]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;

    try {
      const order = await createOrder.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      setOrderComplete({ id: order.id, total: order.total });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process your order. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) return null;

  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="glass-panel p-12 border border-primary/20 max-w-2xl w-full text-center">
            <CheckCircle2 className="mx-auto text-primary w-20 h-20 mb-8" />
            <h1 className="font-serif text-4xl text-gradient-gold mb-4">Order Confirmed</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Thank you for your purchase. Your order #{orderComplete.id} has been received.
            </p>
            <div className="bg-background/50 border border-primary/10 p-6 mb-10 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary/10">
                <span className="text-muted-foreground">Order Reference</span>
                <span className="font-mono text-foreground">RKC-{orderComplete.id.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-serif text-xl text-primary">₹{orderComplete.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none h-12 px-8 uppercase tracking-widest text-xs w-full sm:w-auto">
                  View Order Details
                </Button>
              </Link>
              <Link href="/products">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 px-8 uppercase tracking-widest text-xs w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (!isCartLoading && isEmpty) {
    setLocation("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="bg-card border-b border-primary/10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 border border-primary/20">
              <h2 className="font-serif text-2xl text-foreground mb-8 pb-4 border-b border-primary/10">Shipping Details</h2>
              
              <Form {...form}>
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Full Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="House/Flat No, Street, City, State, PIN Code" 
                              className="bg-background/50 border-primary/20 rounded-none resize-none focus-visible:ring-primary min-h-[100px]"
                              {...field} 
                            />
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
                          <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10-digit mobile number" 
                              className="bg-background/50 border-primary/20 rounded-none focus-visible:ring-primary h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Special instructions for delivery" 
                              className="bg-background/50 border-primary/20 rounded-none focus-visible:ring-primary h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-8 border-t border-primary/10">
                    <h2 className="font-serif text-2xl text-foreground mb-6">Payment Method</h2>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-4"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border border-primary/20 bg-background/50">
                                <FormControl>
                                  <RadioGroupItem value="online" className="text-primary border-primary" />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="font-medium text-foreground cursor-pointer">
                                    Secure Online Payment
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-1">Pay securely via Credit/Debit Card, UPI, or NetBanking</p>
                                </div>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-3 space-y-0 p-4 border border-primary/20 bg-background/50">
                                <FormControl>
                                  <RadioGroupItem value="cod" className="text-primary border-primary" />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="font-medium text-foreground cursor-pointer">
                                    Cash on Delivery (COD)
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-1">Pay with cash upon delivery</p>
                                </div>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </form>
              </Form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-8 border border-primary/20 sticky top-32">
              <h3 className="font-serif text-2xl text-foreground mb-6 pb-4 border-b border-primary/10">Your Order</h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-card border border-primary/10 flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-primary">₹{item.subtotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-primary/10 mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-serif">₹{cart?.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-serif">Free</span>
                </div>
              </div>
              
              <div className="border-t border-primary/20 pt-6 mb-8 flex justify-between items-center">
                <span className="font-medium text-foreground uppercase tracking-widest">Total</span>
                <span className="font-serif text-3xl text-gradient-gold">₹{cart?.total?.toLocaleString('en-IN')}</span>
              </div>
              
              <Button 
                type="submit" 
                form="checkout-form"
                disabled={createOrder.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-14 uppercase tracking-widest text-sm"
              >
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
