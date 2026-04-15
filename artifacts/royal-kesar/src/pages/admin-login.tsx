import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setLocation("/admin");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(formData);
      setLocation("/admin");
    } catch (error) {
      // Error handled in useAuth via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background border border-primary/20 shadow-xl mb-6 group"
            >
              <ShieldAlert className="w-10 h-10 text-primary transition-transform group-hover:scale-110 duration-300" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-4xl text-foreground mb-3 tracking-tight"
            >
              Royal <span className="text-gradient-gold">Control</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-medium"
            >
              Secure Administrator Gateway
            </motion.p>
          </div>

          <Card className="glass-panel border-primary/20 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
            <CardHeader className="space-y-1 pb-6 pt-10 px-8 text-center border-b border-primary/5">
              <CardTitle className="text-xl font-serif tracking-wide text-foreground">Authentication Required</CardTitle>
              <CardDescription className="text-muted-foreground text-[10px] uppercase tracking-widest pt-1">
                Authorized Personnel Only
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Admin Identity</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@royalkesar.com"
                      required
                      className="pl-10 h-12 bg-background/30 border-primary/10 rounded-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40 transition-all font-light tracking-wide"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Token</Label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10 h-12 bg-background/30 border-primary/10 rounded-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40 transition-all font-light tracking-wide text-lg"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-[0.2em] uppercase text-[10px] transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? "Verifying..." : "Authorize Access"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />}
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em]">Encrypted Connection Active</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
