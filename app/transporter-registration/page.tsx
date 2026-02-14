"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function TransporterRegistrationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleCapacity: '',
    operatingAreas: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    yearsExperience: '',
    insuranceDetails: '',
    bankAccount: '',
    idNumber: ''
  });
  const [documents, setDocuments] = useState({
    license: null as File | null,
    insurance: null as File | null,
    id: null as File | null
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof documents) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Transporter registration submitted for review!');
      router.push('/dashboard/transporter');
      setLoadingSubmit(false);
    }, 2000);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Please log in to register as a transporter
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-white pb-24">
      {/* Scanline Effect */}
      <div className="fixed inset-0 bg-scanline opacity-[0.03] pointer-events-none z-50" />

      <main className="container mx-auto px-6 pt-32 max-w-4xl relative z-10">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-12 mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-accent mb-4">
              LOGISTICS NETWORK
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Join the <span className="text-muted-foreground/30 italic">Force.</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black tracking-widest uppercase opacity-40">System Status</div>
              <div className="text-[10px] font-black tracking-widest uppercase text-green-500">Recruiting</div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-px bg-border/50 border border-border/50 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-6 text-center transition-colors ${step === s ? 'bg-accent/5' : 'bg-background hover:bg-muted/5'
                }`}
            >
              <div className={`text-[10px] font-black tracking-widest uppercase mb-2 ${step === s ? 'text-accent' : 'opacity-30'
                }`}>
                Phase 0{s}
              </div>
              <div className={`h-1 mx-auto w-12 ${step >= s ? 'bg-accent' : 'bg-border/30'
                }`} />
            </div>
          ))}
        </div>

        <div className="bg-background border border-border/50 p-8 md:p-12 space-y-12">
          {/* Step 1: Business Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase">Operational Base.</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Define your logistical footprint</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-3">
                  <Label htmlFor="businessName" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="E.G. KEFA LOGISTICS"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs h-12 px-0 bg-transparent uppercase"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="licenseNumber" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="BNL-000000"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs h-12 px-0 bg-transparent uppercase"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vehicleType" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Vehicle Class</Label>
                  <Select name="vehicleType" value={formData.vehicleType} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}>
                    <SelectTrigger className="rounded-none border-0 border-b border-border focus:ring-0 font-black text-xs h-12 px-0 bg-transparent uppercase">
                      <SelectValue placeholder="SELECT CLASS" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border">
                      <SelectItem value="motorcycle" className="uppercase text-[10px] font-black tracking-widest">Motorcycle</SelectItem>
                      <SelectItem value="pickup" className="uppercase text-[10px] font-black tracking-widest">Pickup / Van</SelectItem>
                      <SelectItem value="lorry" className="uppercase text-[10px] font-black tracking-widest">Heavy Lorry</SelectItem>
                      <SelectItem value="trailer" className="uppercase text-[10px] font-black tracking-widest">Articulated Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vehicleCapacity" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Payload Capacity (KG)</Label>
                  <Input
                    id="vehicleCapacity"
                    name="vehicleCapacity"
                    type="number"
                    value={formData.vehicleCapacity}
                    onChange={handleInputChange}
                    placeholder="500"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs h-12 px-0 bg-transparent"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="operatingAreas" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Service Sectors</Label>
                  <Textarea
                    id="operatingAreas"
                    name="operatingAreas"
                    value={formData.operatingAreas}
                    onChange={handleInputChange}
                    placeholder="E.G. NAIROBI METRO, COASTAL REGION"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs min-h-[80px] px-0 bg-transparent uppercase resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase">Direct Line.</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Verified communications only</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-3">
                  <Label htmlFor="contactPerson" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Chief Officer</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="FULL LEGAL NAME"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs h-12 px-0 bg-transparent uppercase"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactPhone" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Verified Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+254 --- --- ---"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs h-12 px-0 bg-transparent"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="insuranceDetails" className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Insurance Underwriter & Policy</Label>
                  <Textarea
                    id="insuranceDetails"
                    name="insuranceDetails"
                    value={formData.insuranceDetails}
                    onChange={handleInputChange}
                    placeholder="COMPANY NAME, POLICY IDENTIFIER, COVERAGE LIMITS"
                    className="rounded-none border-0 border-b border-border focus-visible:ring-0 focus-visible:border-accent font-black text-xs min-h-[80px] px-0 bg-transparent uppercase resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase">Verification Vault.</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Upload credentials for system validation</p>
              </div>

              <div className="grid gap-6">
                {[
                  { id: 'license', label: 'OPERATING LICENSE', state: documents.license },
                  { id: 'insurance', label: 'INSURANCE CERTIFICATE', state: documents.insurance },
                  { id: 'id', label: 'NATIONAL IDENTITY', state: documents.id }
                ].map((doc) => (
                  <div key={doc.id} className="relative group border border-border/50 p-6 flex items-center justify-between hover:border-accent/40 transition-colors">
                    <div className="space-y-1">
                      <Label htmlFor={doc.id} className="text-[10px] font-black tracking-[0.2em] uppercase block cursor-pointer">{doc.label}</Label>
                      <p className="text-[9px] font-bold uppercase opacity-30">PDF, JPG OR PNG (MAX 5MB)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.state && (
                        <div className="flex items-center gap-2 text-accent">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black tracking-widest">READY</span>
                        </div>
                      )}
                      <div className="relative">
                        <Input
                          id={doc.id}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, doc.id as any)}
                        />
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-none border-border/50 text-[9px] font-black tracking-widest uppercase cursor-pointer h-10 px-6 group-hover:border-accent group-hover:text-accent transition-colors"
                        >
                          <label htmlFor={doc.id}>
                            <Upload className="w-3 h-3 mr-2" />
                            {doc.state ? 'REPLACE' : 'SOURCE'}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-muted/5 border border-border/20 p-6 mt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                      BY SUBMITTING, YOU AGREE TO THE LOGISTICS CODE OF CONDUCT. SYSTEM VALIDATION TAKES 48-72 HOURS UPON RECEIPT OF ALL SOURCE DOCUMENTS.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-12 border-t border-border/20">
            <Button
              variant="link"
              onClick={prevStep}
              disabled={step === 1}
              className={`p-0 h-auto text-[10px] font-black tracking-widest uppercase transition-opacity ${step === 1 ? 'opacity-0' : 'opacity-40 hover:opacity-100'
                }`}
            >
              ← PREVIOUS PHASE
            </Button>

            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="btn-premium h-14 px-12 text-[10px] font-black tracking-widest uppercase rounded-none"
              >
                PROCEED TO PHASE 0{step + 1}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loadingSubmit}
                className="btn-premium h-14 px-12 text-[10px] font-black tracking-widest uppercase rounded-none"
              >
                {loadingSubmit ? 'TRANSMITTING...' : 'FINALIZE COMMISSION'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}