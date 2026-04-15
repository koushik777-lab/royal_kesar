import { Layout } from "@/components/layout/layout";
import { useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetProductQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Star, ShieldCheck, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId)
    }
  });

  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(productId) || productId <= 0) {
      toast({
        title: "Invalid Product",
        description: "Could not identify the product. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addToCart.mutateAsync({
        data: {
          productId,
          quantity
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product?.name} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-serif text-3xl text-foreground">Product Not Found</h1>
        </div>
      </Layout>
    );
  }

  const displayImage = selectedImage || product.imageUrl;
  const rawImages = [product.imageUrl, ...(product.images || [])].filter(img => img && img.trim() !== "") as string[];
  const allImages = Array.from(new Set(rawImages));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-card border border-primary/20 relative overflow-hidden flex items-center justify-center">
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-4xl text-primary/20">RKC</span>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square bg-card border overflow-hidden ${displayImage === img ? 'border-primary' : 'border-primary/20 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col pt-8 lg:pt-0">
            <p className="text-primary text-sm uppercase tracking-widest mb-4">{product.categoryName}</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i >= Math.floor(product.rating) ? "text-muted" : ""} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewCount} Reviews)</span>
            </div>

            <div className="mb-8">
              <span className="font-serif text-3xl text-gradient-gold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-3 text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-muted-foreground font-light mb-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />

            <div className="grid grid-cols-2 gap-4 mb-10">
              {product.weight && (
                <div className="p-4 bg-card border border-primary/10 flex flex-col gap-1 text-center">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Net Weight</span>
                  <span className="font-serif text-lg text-foreground">{product.weight}</span>
                </div>
              )}
              {product.origin && (
                <div className="p-4 bg-card border border-primary/10 flex flex-col gap-1 text-center">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Origin</span>
                  <span className="font-serif text-lg text-foreground">{product.origin}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <div className="flex items-center border border-primary/30 bg-card h-14 w-full sm:w-32 justify-between px-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted-foreground hover:text-primary p-2"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="font-medium text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="text-muted-foreground hover:text-primary p-2"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button 
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock === 0}
                className="flex-1 h-14 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase flex items-center gap-2"
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

            <div className="border-t border-primary/20 pt-8 mt-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <ShieldCheck className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1 uppercase tracking-wider">100% Authentic</h4>
                  <p className="text-xs text-muted-foreground">Directly sourced from our Pampore farms.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Leaf className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1 uppercase tracking-wider">Pure & Natural</h4>
                  <p className="text-xs text-muted-foreground">No additives, preservatives, or artificial colors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
