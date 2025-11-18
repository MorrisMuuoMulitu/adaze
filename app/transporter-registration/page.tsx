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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Truck className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Transporter Registration</CardTitle>
              <CardDescription>
                Join ADAZE&apos;s transporter network and start earning today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <Badge
                        variant={step === s ? 'default' : 'secondary'}
                        className={`rounded-full w-10 h-10 flex items-center justify-center ${step >= s ? 'bg-blue-600' : 'bg-muted'
                          }`}
                      >
                        {s}
                      </Badge>
                      {s < 3 && (
                        <div className={`h-1 w-16 mx-2 ${step > s ? 'bg-blue-600' : 'bg-muted'
                          }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Business Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-6">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          placeholder="e.g., Kefa Transport Services"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Business License Number *</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., BNL2021001234"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select name="vehicleType" value={formData.vehicleType} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup/Daladala</SelectItem>
                          <SelectItem value="van">Van (3-5 tons)</SelectItem>
                          <SelectItem value="lorry">Lorry (6-12 tons)</SelectItem>
                          <SelectItem value="trailer">Trailer (13+ tons)</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleCapacity">Vehicle Capacity (kg) *</Label>
                      <Input
                        id="vehicleCapacity"
                        name="vehicleCapacity"
                        type="number"
                        value={formData.vehicleCapacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingAreas">Operating Areas *</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Textarea
                          id="operatingAreas"
                          name="operatingAreas"
                          value={formData.operatingAreas}
                          onChange={handleInputChange}
                          placeholder="e.g., Nairobi, Mombasa, Kisumu"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Years of Experience *</Label>
                      <Select name="yearsExperience" value={formData.yearsExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, yearsExperience: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">More than 5 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number *</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          placeholder="e.g., +254 712 345 678"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="e.g., contact@transporter.co.ke"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">National ID Number *</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., 12345678"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="insuranceDetails">Insurance Details *</Label>
                      <Textarea
                        id="insuranceDetails"
                        name="insuranceDetails"
                        value={formData.insuranceDetails}
                        onChange={handleInputChange}
                        placeholder="Insurance company, policy number, coverage details"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bankAccount">Bank Account for Payments *</Label>
                      <Input
                        id="bankAccount"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        placeholder="e.g., KCB Acc No. 1234567890"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-6">Required Documents</h3>
                  <p className="text-muted-foreground mb-6">
                    Please upload the following documents to complete your registration
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="licenseUpload">Business License *</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="licenseUpload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'license')}
                            className="pl-10"
                          />
                        </div>
                        {documents.license && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceUpload">Insurance Certificate *</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="insuranceUpload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'insurance')}
                            className="pl-10"
                          />
                        </div>
                        {documents.insurance && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idUpload">National ID Copy *</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="idUpload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'id')}
                            className="pl-10"
                          />
                        </div>
                        {documents.id && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900">Registration Process</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            After submitting your application, our team will review your documents and credentials.
                            You&apos;ll receive an email notification within 2-3 business days regarding your application status.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>

                {step < 3 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loadingSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingSubmit ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}