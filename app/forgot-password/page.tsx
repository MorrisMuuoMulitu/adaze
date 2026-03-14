"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Reset link sent!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12">
        <div className="space-y-4 text-left">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60">
            SECURITY // PROTOCOL
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            Recover <span className="font-serif italic text-muted-foreground/30 lowercase">Access.</span>
          </h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest max-w-xs">
            Enter your identity manifest to receive a restoration link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black tracking-widest uppercase text-destructive/80 mb-2 block">
                  Identity / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    type="email"
                    placeholder="USER@COLLECTIVE.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 pl-12 rounded-none border-border/50 bg-muted/5 font-mono text-[11px] tracking-widest uppercase focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-premium h-16 rounded-none text-[12px] font-black uppercase tracking-[0.4em]"
            >
              {loading ? "Processing..." : "Initiate Recovery"}
            </Button>

            <div className="pt-4">
              <Link
                href="/?auth=login"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              >
                <ArrowLeft className="h-3 w-3" /> Return to Gateway
              </Link>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-8 border border-accent/30 bg-accent/5"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Transmission Sent</h3>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
                If an account exists for <span className="text-accent">{email}</span>, 
                you will receive a restoration link shortly.
              </p>
            </div>
            
            <div className="pt-4 border-t border-accent/20">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4">
                No transmission received? Check your filters.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full h-12 rounded-none border-accent/30 text-[9px] font-black uppercase tracking-widest hover:bg-accent/10"
              >
                Attempt New Transmission
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
