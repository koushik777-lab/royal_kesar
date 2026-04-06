import { ReactNode } from "react";
import { Link } from "wouter";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/cart/cart-drawer";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { data: cart } = useGetCart({
    query: {
      enabled: isAuthenticated,
    }
  });

  const itemCount = cart?.itemCount || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Collection", href: "/products" },
    { name: "Heritage", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled ? "glass-panel py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center justify-center group absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-widest text-gradient-gold uppercase">
                ROYAL KESAR
              </span>
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase hidden md:block">
                Company
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                href={isAuthenticated ? (isAdmin ? "/admin" : "/account") : "/login"}
                className="text-foreground hover:text-primary transition-colors hidden sm:block"
              >
                <User size={20} />
              </Link>
              
              <button 
                className="text-foreground hover:text-primary transition-colors relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif text-xl font-bold tracking-widest text-gradient-gold uppercase">
                RKC
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 items-center justify-center flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-serif text-3xl text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="w-12 h-[1px] bg-primary/30 my-4"></div>
              
              <Link
                href={isAuthenticated ? (isAdmin ? "/admin" : "/account") : "/login"}
                className="text-lg tracking-widest uppercase text-muted-foreground hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isAuthenticated ? "My Account" : "Sign In"}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-primary/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl font-bold tracking-widest text-gradient-gold uppercase mb-4">
              RKC
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The most prestigious saffron purveyor from Pampore, Kashmir. A heritage of purity, cultivated in the rich karewa soil.
            </p>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold tracking-wider uppercase mb-6 text-sm">Explore</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Collection</Link></li>
              <li><Link href="/products?category=saffron" className="text-muted-foreground hover:text-primary transition-colors text-sm">Premium Saffron</Link></li>
              <li><Link href="/products?category=dry-fruits" className="text-muted-foreground hover:text-primary transition-colors text-sm">Kashmiri Dry Fruits</Link></li>
              <li><Link href="/products?category=pashmina" className="text-muted-foreground hover:text-primary transition-colors text-sm">Pashmina Shawls</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold tracking-wider uppercase mb-6 text-sm">The Brand</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Heritage</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm">Client Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-semibold tracking-wider uppercase mb-6 text-sm">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
              <li>Pampore, Jammu & Kashmir</li>
              <li>India - 192121</li>
              <li className="pt-2">Saket, New Delhi</li>
              <li>(Near Metro Station)</li>
              <li className="pt-2 text-primary">600313206 / 7780813169</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Royal Kesar Company. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/royalkesarcompany22" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs uppercase tracking-wider">
              Instagram
            </a>
            <a href="https://facebook.com/royalkesarcompany22" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs uppercase tracking-wider">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-pattern-kashmiri">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
