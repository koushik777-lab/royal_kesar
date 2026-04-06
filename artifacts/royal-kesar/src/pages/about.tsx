import { Layout } from "@/components/layout/layout";

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0">
          <img 
            src="/images/hero-pampore.png" 
            alt="Pampore Fields" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="relative z-10 text-center max-w-3xl px-4">
          <h1 className="font-serif text-4xl md:text-6xl text-gradient-gold mb-6">Our Heritage</h1>
          <p className="text-muted-foreground text-lg uppercase tracking-widest">Rooted in the Karewa Soil of Pampore</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6">The Saffron Town</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Royal Kesar Company is located in Pampore, in the Pulwama district of Kashmir — universally known as the saffron town. 
              </p>
              <p>
                Spread across 3,715 hectares, these fields carry deep cultural and agricultural heritage. The unique karewa soil — a plateau-like terrace formation found only in Kashmir — gives Pampore saffron its unmatched aroma, color, and quality.
              </p>
              <p>
                "My name is Sirajuddin Bhat, a farmer rooted in this tradition. For us, saffron is not just a crop — it is a way of life. Every strand is nurtured with dedication."
              </p>
            </div>
            
            <div className="mt-12 p-8 border border-primary/20 bg-card glass-panel relative">
              <div className="absolute -top-3 left-8 bg-background px-4 font-serif text-primary italic">The Royal Promise</div>
              <p className="text-foreground font-light">We guarantee the absolute purity of every product bearing the Royal Kesar Company seal. Hand-harvested, ethically sourced, and naturally processed.</p>
            </div>
          </div>
          
          <div className="relative h-[600px]">
            <img 
              src="/images/boutique-interior.png" 
              alt="Boutique" 
              className="w-full h-full object-cover rounded-sm grayscale-[0.2] border border-primary/10"
            />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 border border-primary/30 bg-background/50 backdrop-blur-md p-4 hidden md:block">
              <img 
                src="/images/saffron-closeup.png" 
                alt="Saffron" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
