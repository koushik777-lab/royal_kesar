import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a redirect query param
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      setLocation(redirect || "/account");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values);
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/boutique-interior.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="container px-4 relative z-10 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="glass-panel p-10 border border-primary/20 rounded-sm shadow-2xl relative overflow-hidden">
              {/* Gold decorative lines */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              
              <div className="text-center mb-10">
                <h1 className="font-serif text-3xl text-gradient-gold mb-2">Sign In</h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest">Access your Royal Kesar account</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            className="bg-background/40 border-primary/20 focus-visible:ring-primary rounded-none h-12 px-4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs flex justify-between">
                          <span>Password</span>
                          <span className="text-primary hover:underline cursor-pointer opacity-70">Forgot?</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            className="bg-background/40 border-primary/20 focus-visible:ring-primary rounded-none h-12 px-4" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none uppercase tracking-widest text-sm mt-8 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center border-t border-primary/10 pt-6">
                <p className="text-muted-foreground text-sm">
                  Do not have an account?{" "}
                  <Link href={`/register${window.location.search}`} className="text-primary hover:text-primary-foreground transition-colors font-medium">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
