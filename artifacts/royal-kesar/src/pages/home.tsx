import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-pampore.png" 
            alt="Pampore Saffron Fields" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 border border-primary/30 rounded-full text-xs uppercase tracking-[0.2em] text-primary glass-panel">
              Est. 1921 &bull; Pampore, Kashmir
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-wide mb-6 leading-tight max-w-4xl text-gradient-gold drop-shadow-2xl"
          >
            The Essence of Kashmir, Crafted in Gold
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-light leading-relaxed"
          >
            Discover the world's most prestigious saffron, cultivated for centuries in the rich karewa soil of Pampore.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-14 rounded-none text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating saffron threads SVG decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.svg
              key={i}
              className="absolute text-accent opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 7h2v6h-2zm0 8h2v2h-2z" />
              <path d="M12 4C8.69 4 6 6.69 6 10s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </motion.svg>
          ))}
        </div>
      </section>

      {/* Categories Highlights */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">The Royal Treasury</h2>
            <div className="w-16 h-px bg-primary/50 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Premium Saffron", image: "/images/saffron-closeup.png", link: "/products?category=saffron" },
              { title: "Kashmiri Dry Fruits", image: "/images/walnuts.png", link: "/products?category=dry-fruits" },
              { title: "Pashmina Shawls", image: "/images/pashmina.png", link: "/products?category=pashmina" }
            ].map((cat, i) => (
              <Link key={i} href={cat.link} className="group relative h-[400px] overflow-hidden rounded-sm border border-primary/10 block">
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-serif text-2xl text-white mb-2">{cat.title}</h3>
                  <span className="text-primary text-sm uppercase tracking-widest flex items-center gap-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Discover <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Curated Collection</h2>
              <p className="text-muted-foreground max-w-xl">Exceptional quality sourced directly from the growers and artisans of Kashmir.</p>
            </div>
            <Link href="/products" className="text-primary hover:text-primary-foreground hover:bg-primary border border-primary px-6 py-2 transition-all text-sm uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-[300px] w-full mb-4 rounded-sm"></div>
                  <div className="h-4 bg-muted w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted w-1/4"></div>
                </div>
              ))
            ) : (
              featuredProducts?.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                  <div className="relative h-[350px] overflow-hidden bg-card border border-primary/10 mb-4">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/20 font-serif text-2xl">RKC</div>
                    )}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-primary/20 px-3 py-1 text-xs text-primary uppercase tracking-wider">
                      {product.weight || 'Premium'}
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-1 truncate">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{product.categoryName}</p>
                    <p className="text-primary font-serif tracking-wide">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Heritage Teaser */}
      <section className="py-24 relative overflow-hidden bg-card border-y border-primary/20">
        <div className="absolute inset-0">
          <img 
            src="/images/boutique-interior.png" 
            alt="Interior" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex justify-center">
          <div className="glass-panel p-8 md:p-16 max-w-3xl text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-gradient-gold mb-6">A Century of Purity</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm md:text-base">
              "For us, saffron is not just a crop — it is a way of life. Every strand is nurtured with dedication in the unique karewa soil of Pampore. Our heritage is woven into every product we offer."
            </p>
            <p className="font-serif italic text-primary mb-8">— Sirajuddin Bhat, Founder</p>
            <Link href="/about">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none uppercase tracking-widest text-xs px-8">
                Read Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-primary mb-4">Words of Appreciation</h2>
            <div className="w-16 h-px bg-primary/50 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "The most fragrant saffron I have ever used. A single strand transforms my culinary creations.", author: "Chef Aisha R.", location: "New Delhi" },
              { text: "Their Pashmina shawls are exquisite. You can feel the generations of craftsmanship in the weave.", author: "Sarah M.", location: "Mumbai" },
              { text: "The walnuts are incredibly fresh and rich. True Kashmiri quality that is hard to find elsewhere.", author: "Vikram S.", location: "Bangalore" }
            ].map((test, i) => (
              <div key={i} className="bg-card border border-primary/10 p-8 rounded-sm relative">
                <div className="absolute top-4 right-4 flex gap-1 text-primary">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="text-muted-foreground italic mb-6 mt-4 line-clamp-4">"{test.text}"</p>
                <div>
                  <p className="font-serif text-foreground">{test.author}</p>
                  <p className="text-xs text-primary/70 uppercase tracking-widest mt-1">{test.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
