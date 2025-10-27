"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User,
  Truck,
  Navigation,
  Search,
  Filter,
  MessageCircle,
  Phone,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Transporter {
  id: string;
  name: string;
  rating: number;
  totalDeliveries: number;
  location: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  distance: number; // in km from pickup location
}

interface TransporterRequest {
  id: string;
  orderId: string;
  fromLocation: string;
  toLocation: string;
  distance: number;
  estimatedTime: string; // in minutes
  amount: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  transporterId?: string;
}

export default function TransporterConnectionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'history'>('find');
  const [availableTransporters, setAvailableTransporters] = useState<Transporter[]>([]);
  const [requests, setRequests] = useState<TransporterRequest[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'buyer' && user.role !== 'trader' && user.role !== 'wholesaler'))) {
      router.push('/auth/login');
      toast.error('Access denied. Buyers, traders, and wholesalers only.');
    }
  }, [user, loading, router]);

  // Mock data for available transporters
  useEffect(() => {
    const mockTransporters: Transporter[] = [
      {
        id: '1',
        name: 'Kefa Transport Services',
        rating: 4.8,
        totalDeliveries: 245,
        location: 'Nairobi CBD',
        phone: '+254 712 345 678',
        status: 'available',
        distance: 2.5
      },
      {
        id: '2',
        name: 'Mombasa Logistics',
        rating: 4.6,
        totalDeliveries: 189,
        location: 'Industrial Area',
        phone: '+254 722 123 456',
        status: 'available',
        distance: 5.2
      },
      {
        id: '3',
        name: 'Swift Delivery Co.',
        rating: 4.9,
        totalDeliveries: 312,
        location: 'Westlands',
        phone: '+254 733 987 654',
        status: 'busy',
        distance: 4.1
      },
      {
        id: '4',
        name: 'Quick Transport',
        rating: 4.5,
        totalDeliveries: 156,
        location: 'Kilimani',
        phone: '+254 700 111 222',
        status: 'available',
        distance: 3.0
      }
    ];

    setAvailableTransporters(mockTransporters);
  }, []);

  // Mock data for requests
  useEffect(() => {
    const mockRequests: TransporterRequest[] = [
      {
        id: 'req1',
        orderId: 'ORD-001',
        fromLocation: 'Traders Market, Nairobi',
        toLocation: 'Kawangware, Nairobi',
        distance: 6.5,
        estimatedTime: '45',
        amount: 450,
        timestamp: '2025-10-27T10:30:00Z',
        status: 'accepted',
        transporterId: '1'
      },
      {
        id: 'req2',
        orderId: 'ORD-002',
        fromLocation: 'JKIA Cargo, Nairobi',
        toLocation: 'Thika Road, Nairobi',
        distance: 12.0,
        estimatedTime: '60',
        amount: 850,
        timestamp: '2025-10-27T09:15:00Z',
        status: 'pending'
      },
      {
        id: 'req3',
        orderId: 'ORD-003',
        fromLocation: 'Pipeline, Nairobi',
        toLocation: 'Ngara, Nairobi',
        distance: 5.8,
        estimatedTime: '30',
        amount: 350,
        timestamp: '2025-10-26T16:45:00Z',
        status: 'completed'
      }
    ];

    setRequests(mockRequests);
  }, []);

  const handleFindTransporter = () => {
    toast.success('Transporter search initiated!');
    // In real app, this would call an API to find available transporters
  };

  const handleRequestTransporter = (transporter: Transporter) => {
    setSelectedTransporter(transporter);
    toast.success(`Request sent to ${transporter.name}`);
    // In real app, this would create a transporter request in the system
  };

  const handleContactTransporter = (transporter: Transporter) => {
    toast.info(`Contacting ${transporter.name} at ${transporter.phone}`);
    // In real app, this would open a communication channel
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'buyer' && user.role !== 'trader' && user.role !== 'wholesaler')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              This service is for buyers, traders, and wholesalers only
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/auth/login')}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Transporter Services</h1>
              <p className="text-muted-foreground">
                Connect with reliable transporters for your goods delivery
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b mb-8">
            <Button
              variant={activeTab === 'find' ? 'default' : 'ghost'}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              onClick={() => setActiveTab('find')}
            >
              <Search className="h-4 w-4 mr-2" />
              Find Transporter
            </Button>
            <Button
              variant={activeTab === 'requests' ? 'default' : 'ghost'}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              onClick={() => setActiveTab('requests')}
            >
              <Clock className="h-4 w-4 mr-2" />
              My Requests
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              onClick={() => setActiveTab('history')}
            >
              <Package className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>

          {/* Find Transporter Tab */}
          {activeTab === 'find' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Find Transporter
                  </CardTitle>
                  <CardDescription>
                    Search for available transporters in your area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Enter pickup location"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <Button onClick={handleFindTransporter} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Transporters</h3>
                    {availableTransporters
                      .filter(t => t.status === 'available')
                      .map((transporter) => (
                        <Card key={transporter.id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{transporter.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{transporter.rating} ★</span>
                                    <span>•</span>
                                    <span>{transporter.totalDeliveries} deliveries</span>
                                    <span>•</span>
                                    <span>{transporter.location}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{transporter.distance} km away</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{transporter.phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleContactTransporter(transporter)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleRequestTransporter(transporter)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Request
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    My Transporter Requests
                  </CardTitle>
                  <CardDescription>
                    Track the status of your transporter requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'pending' || r.status === 'accepted')
                      .map((request) => (
                        <Card key={request.id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                                <h4 className="font-semibold">Order {request.orderId}</h4>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>From: {request.fromLocation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>To: {request.toLocation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>KSh {request.amount}</span>
                                  <span>•</span>
                                  <span>{request.distance} km</span>
                                  <span>•</span>
                                  <span>{request.estimatedTime} min</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Requested: {new Date(request.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Navigation className="h-4 w-4 mr-2" />
                                Track
                              </Button>
                              <Button size="sm">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Transporter History
                  </CardTitle>
                  <CardDescription>
                    View your past transporter requests and deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'completed' || r.status === 'cancelled')
                      .map((request) => (
                        <Card key={request.id} className="p-4 opacity-80">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge 
                                  variant={request.status === 'completed' ? 'default' : 'destructive'}
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                                <h4 className="font-semibold">Order {request.orderId}</h4>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>From: {request.fromLocation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>To: {request.toLocation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>KSh {request.amount}</span>
                                  <span>•</span>
                                  <span>{request.distance} km</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Completed: {new Date(request.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}