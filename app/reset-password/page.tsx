"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid restoration token");
      setValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setIsValid(true);
          setEmail(data.email);
        } else {
          toast.error(data.message || "Token verification failed");
        }
      } catch (error) {
        toast.error("System error during verification");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Sequence mismatch: Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Sequence too short: Minimum 6 characters required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Identity restoration complete!");
        setTimeout(() => router.push("/?auth=login"), 2000);
      } else {
        toast.error(data.message || "Reset sequence failed");
      }
    } catch (error) {
      toast.error("An unexpected system error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Verifying Protocol...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="space-y-8 p-8 border border-destructive/30 bg-destructive/5 text-center">
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">Protocol Nullified</h3>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
            This restoration link is invalid or has expired. Please initiate a new recovery request.
          </p>
        </div>
        <Button
          onClick={() => router.push("/forgot-password")}
          className="w-full h-12 rounded-none border-destructive/30 text-[9px] font-black uppercase tracking-widest hover:bg-destructive/10"
          variant="outline"
        >
          New Recovery Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4 p-4 border border-accent/20 bg-accent/5 mb-8">
        <div className="text-[8px] font-black uppercase tracking-widest text-accent">Authorized Entity</div>
        <div className="text-[11px] font-mono uppercase tracking-tighter truncate">{email}</div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black tracking-widest uppercase text-destructive/80 mb-2 block">
            New Sequence
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-16 pl-12 pr-12 rounded-none border-border/50 bg-muted/5 font-mono text-[11px] focus:border-accent/50 transition-colors"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black tracking-widest uppercase text-destructive/80 mb-2 block">
            Verify Sequence
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-16 pl-12 rounded-none border-border/50 bg-muted/5 font-mono text-[11px] focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-premium h-16 rounded-none text-[12px] font-black uppercase tracking-[0.4em]"
      >
        {loading ? "Synchronizing..." : "Commit Changes"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12">
        <div className="space-y-4 text-left">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent/60">
            SECURITY // RESTORATION
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
            Set <span className="font-serif italic text-muted-foreground/30 lowercase">Sequence.</span>
          </h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest max-w-xs">
            Establish your new security parameters to regain authority.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Protocol...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
