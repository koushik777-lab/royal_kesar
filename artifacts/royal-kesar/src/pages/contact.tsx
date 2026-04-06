import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We have received your message and will respond shortly.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-gradient-gold mb-6">Contact Us</h1>
          <div className="w-16 h-px bg-primary/50 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl text-primary mb-6">Reach Out</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are looking to purchase premium Kashmiri saffron, inquire about bulk orders, or simply want to learn more about our heritage, we are here to assist you.
              </p>
            </div>

            <div className="grid gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-sm border border-primary/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Our Locations</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <strong className="text-foreground">RKC Royal Kesar Company</strong><br />
                    Pampore, Jammu & Kashmir<br />
                    India - 192121
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                    Saket, New Delhi<br />
                    (Near Metro Station)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-sm border border-primary/20">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Phone</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    600313206<br />
                    7780813169
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-sm border border-primary/20">
                  <Instagram size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Social Media</h3>
                  <div className="flex gap-4 text-sm">
                    <a href="https://instagram.com/royalkesarcompany22" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <Instagram size={16} /> @royalkesarcompany22
                    </a>
                  </div>
                  <div className="flex gap-4 text-sm mt-2">
                    <a href="https://facebook.com/royalkesarcompany22" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <Facebook size={16} /> @royalkesarcompany22
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel p-8 md:p-10 rounded-sm">
            <h2 className="font-serif text-2xl text-foreground mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Name</label>
                <Input required className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none h-12" placeholder="Your full name" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <Input required type="email" className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none h-12" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                  <Input className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none h-12" placeholder="Your phone number" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Message</label>
                <Textarea required className="bg-background/50 border-primary/20 focus-visible:ring-primary rounded-none min-h-[150px] resize-none" placeholder="How can we help you?" />
              </div>
              
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none uppercase tracking-widest text-sm mt-4">
                Send Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
