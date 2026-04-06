import { Layout } from "@/components/layout/layout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Products() {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({
    categoryId,
    search: debouncedSearch || undefined,
  });

  return (
    <Layout>
      {/* Header */}
      <div className="bg-card border-b border-primary/10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Our Collection</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of premium Kashmiri saffron, dry fruits, and handcrafted Pashmina shawls.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary" /> Filters
              </h3>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 bg-background/50 border-primary/20 rounded-none h-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    // Debounce logic would go here in a real app
                    setTimeout(() => setDebouncedSearch(e.target.value), 500);
                  }}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Categories</h4>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setCategoryId(undefined)}
                    className={`text-left text-sm transition-colors ${!categoryId ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  >
                    All Collection
                  </button>
                  {categories?.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`text-left text-sm transition-colors ${categoryId === cat.id ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                    >
                      {cat.name} ({cat.productCount})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-[400px] w-full mb-4 rounded-sm border border-primary/10"></div>
                    <div className="h-4 bg-muted w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-24 bg-card border border-primary/10 rounded-sm">
                <h3 className="font-serif text-2xl text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setCategoryId(undefined); setSearch(""); setDebouncedSearch(""); }}
                  className="mt-6 text-primary uppercase tracking-widest text-sm border-b border-primary pb-1"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products?.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group block">
                    <div className="relative h-[400px] overflow-hidden bg-card border border-primary/10 mb-4">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20 font-serif text-3xl">RKC</div>
                      )}
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {product.weight && (
                          <div className="bg-background/80 backdrop-blur-sm border border-primary/20 px-3 py-1 text-xs text-primary uppercase tracking-wider text-center">
                            {product.weight}
                          </div>
                        )}
                        {product.featured && (
                          <div className="bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider text-center font-medium shadow-md">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-1">{product.name}</h3>
                      <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">{product.categoryName}</p>
                      <p className="text-primary font-serif tracking-wide text-lg">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
