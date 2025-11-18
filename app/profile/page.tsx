"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar } from '@/lib/supabase/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MapPin, Phone, User as UserIcon, Mail, Camera, AlertTriangle, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar'; // Import Navbar
import { AuthModal } from '@/components/auth/auth-modal'; // Import AuthModal
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  avatar_url: string;
  role: 'buyer' | 'trader' | 'transporter';
  created_at: string; // Add created_at to the Profile interface
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    avatar_url: '',
    role: 'buyer',
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleAuthClick = (type: 'login' | 'register') => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log('Fetching profile for user ID:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, location, avatar_url, role, created_at') // Include created_at
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          const appError = ErrorHandler.handle(error, 'fetchProfile');
          ErrorHandler.showErrorToast(appError, `Failed to load profile: ${appError.message}`);
        } else if (data) {
          console.log('Successfully fetched profile data:', data);
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            location: data.location || '',
            avatar_url: data.avatar_url || '',
            role: data.role || 'buyer',
          });
        } else {
          console.log('No profile data returned for user ID:', user.id);
          toast.error('No profile data found.');
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        const appError = ErrorHandler.handle(err, 'fetchProfile');
        ErrorHandler.showErrorToast(appError, 'An unexpected error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router, supabase]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (value.trim().length > 100) return 'Full name must be less than 100 characters';
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Phone number contains invalid characters';
        if (value && value.replace(/\D/g, '').length > 15) return 'Phone number is too long';
        break;
      case 'location':
        if (value && value.trim().length > 100) return 'Location must be less than 100 characters';
        break;
      case 'avatar_url':
        if (value && !isValidUrl(value)) return 'Invalid URL format';
        break;
      default:
        break;
    }
    return null;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      toast.error('No file selected');
      return;
    }

    const file = e.target.files[0];

    // Validate file before uploading
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (jpeg, png, webp)');
      return;
    }

    setUploading(true);

    try {
      // Upload file using the utility function
      const { publicUrl } = await uploadAvatar(user?.id || '', file);

      if (publicUrl) {
        // Update the form data with the new avatar URL
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

        // Update the profile directly in the database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user?.id || '');

        if (updateError) {
          console.error('Error updating avatar:', updateError);
          const appError = ErrorHandler.handle(updateError, 'updateAvatar');
          ErrorHandler.showErrorToast(appError, `Failed to update avatar: ${appError.message}`);
        } else {
          // Update local profile state
          setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
          ErrorHandler.showSuccessToast('Avatar uploaded successfully!');
        }
      } else {
        toast.error('Failed to get public URL for uploaded image');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const appError = ErrorHandler.handle(error, 'uploadAvatar');
      ErrorHandler.showErrorToast(appError, `Error uploading avatar: ${appError.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/account/deactivate', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account deactivated', {
          description: 'Your account has been deactivated. Contact support to reactivate.',
        });
        // Redirect to home after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error('Failed to deactivate account', {
          description: result.error || 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('An error occurred', {
        description: 'Failed to deactivate account',
      });
    } finally {
      setActionLoading(false);
      setShowDeactivateDialog(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) {
      toast.error('Email does not match', {
        description: 'Please enter your email correctly to confirm deletion',
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmEmail: deleteConfirmEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account deleted', {
          description: 'Your account and all data have been permanently deleted.',
        });
        // Redirect to home after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error('Failed to delete account', {
          description: result.error || 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('An error occurred', {
        description: 'Failed to delete account',
      });
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
      setDeleteConfirmEmail('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form before saving.');
      return;
    }

    setLoading(true);

    if (!user) {
      toast.error('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        const appError = ErrorHandler.handle(error, 'updateProfile');
        ErrorHandler.showErrorToast(appError, `Failed to update profile: ${appError.message}`);
      } else {
        ErrorHandler.showSuccessToast('Profile updated successfully!');
        setEditing(false);
        // Re-fetch profile to update UI with latest data
        // For simplicity, we'll just update the local state for now
        setProfile((prev) => prev ? {
          ...prev,
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          avatar_url: formData.avatar_url,
          role: formData.role as 'buyer' | 'trader' | 'transporter'
        } : null);
      }
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      const appError = ErrorHandler.handle(err, 'updateProfile');
      ErrorHandler.showErrorToast(appError, 'An unexpected error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Profile not found or not logged in.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialType={authModalType}
        onSuccess={handleCloseAuthModal} // Add onSuccess prop
      />
      <main className="flex-grow">
        <div className="min-h-screen bg-background py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Account</h1>
                <Button variant="outline" onClick={() => router.push('/marketplace')}>
                  Back to Shopping
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Summary Card */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="relative inline-block">
                          <Avatar className="h-32 w-32 mx-auto">
                            <AvatarImage src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || user.email}&background=random`} alt={profile.full_name || user.email} />
                            <AvatarFallback className="text-2xl">{(profile.full_name || user.email)?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {editing && (
                            <label className="absolute bottom-2 right-2 bg-primary rounded-full p-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                              <Camera className={`h-4 w-4 text-white ${uploading ? 'animate-pulse' : ''}`} />
                            </label>
                          )}
                        </div>
                        {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}

                        <h2 className="text-xl font-bold mt-4">{profile.full_name || user.email}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="mt-2 capitalize">{profile.role}</Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Member since</p>
                            <p className="font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{profile.phone || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{profile.location || 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/orders')}>
                          My Orders
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/cart')}>
                          Shopping Cart
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            try {
                              // Terminate active session
                              if (user?.id) {
                                const { terminateSession } = await import('@/lib/login-tracker');
                                await terminateSession(user.id);
                              }

                              await supabase.auth.signOut();
                              // Use window.location for full page reload to clear auth state
                              window.location.href = '/';
                            } catch (error) {
                              console.error('Error logging out:', error);
                              // Even on error, redirect to landing page
                              window.location.href = '/';
                            }
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Details Card */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Profile Information</CardTitle>
                      <CardDescription>Manage your personal information and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!editing ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                              <p className="text-lg font-medium">{profile.full_name || 'Not set'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                              <p className="text-lg font-medium">{user.email}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                              <p className="text-lg font-medium">{profile.phone || 'Not set'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                              <p className="text-lg font-medium">{profile.location || 'Not set'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                              <p className="text-lg font-medium capitalize">{profile.role}</p>
                            </div>
                          </div>

                          <div className="flex justify-end pt-6">
                            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="full_name">Full Name</Label>
                              <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={errors.full_name ? 'border-red-500' : ''}
                              />
                              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
                            </div>

                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className={errors.phone ? 'border-red-500' : ''}
                              />
                              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter your location"
                                className={errors.location ? 'border-red-500' : ''}
                              />
                              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                            </div>

                            <div>
                              <Label htmlFor="role">Role</Label>
                              <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full border border-input bg-background rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled
                              >
                                <option value="buyer">Buyer</option>
                                <option value="trader">Trader</option>
                                <option value="transporter">Transporter</option>
                              </select>
                              <p className="text-xs text-muted-foreground mt-1">Role cannot be changed directly</p>
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor="avatar_url">Avatar URL</Label>
                              <Input
                                id="avatar_url"
                                name="avatar_url"
                                value={formData.avatar_url}
                                onChange={handleChange}
                                placeholder="URL to your avatar image"
                                className={errors.avatar_url ? 'border-red-500' : ''}
                                disabled={uploading} // Disable when uploading
                              />
                              {errors.avatar_url && <p className="text-sm text-red-500 mt-1">{errors.avatar_url}</p>}
                              <p className="text-sm text-muted-foreground mt-1">Or upload an image using the camera icon above</p>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditing(false);
                                  setFormData({
                                    full_name: profile.full_name || '',
                                    phone: profile.phone || '',
                                    location: profile.location || '',
                                    avatar_url: profile.avatar_url || '',
                                    role: profile.role || 'buyer',
                                  });
                                  setErrors({}); // Clear any validation errors
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                            </div>
                            <Button type="submit" disabled={loading || Object.keys(errors).length > 0}>
                              {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Stats */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Order Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Total Orders</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">KSh 0.00</p>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Items Purchased</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Management - Danger Zone */}
                  <Card className="mt-6 border-red-200 dark:border-red-900">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-600">Account Management</CardTitle>
                      </div>
                      <CardDescription>
                        Manage your account status or permanently delete your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Deactivate Account */}
                      <div className="p-4 border border-orange-200 dark:border-orange-900 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <PauseCircle className="h-5 w-5 text-orange-600" />
                              <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                                Deactivate Account
                              </h3>
                            </div>
                            <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                              Temporarily suspend your account. You can contact support to reactivate it later.
                              Your data will be preserved.
                            </p>
                            <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1 mb-3">
                              <li>• You will be signed out immediately</li>
                              <li>• You cannot login until reactivated</li>
                              <li>• All your data remains safe</li>
                              <li>• Contact support to reactivate</li>
                            </ul>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                          onClick={() => setShowDeactivateDialog(true)}
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Deactivate Account
                        </Button>
                      </div>

                      {/* Delete Account */}
                      <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Trash2 className="h-5 w-5 text-red-600" />
                              <h3 className="font-semibold text-red-900 dark:text-red-100">
                                Delete Account Permanently
                              </h3>
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 mb-3">
                              <li>• Your profile will be deleted</li>
                              <li>• All your orders history will be removed</li>
                              <li>• Your cart and wishlist will be cleared</li>
                              <li>• This action is irreversible</li>
                            </ul>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account Permanently
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div >
      </main >

      {/* Deactivate Account Dialog */}
      < AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PauseCircle className="h-5 w-5 text-orange-600" />
              Deactivate Your Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your account will be temporarily suspended and you will be signed out immediately.
              </p>
              <p className="font-semibold">
                To reactivate your account, you&apos;ll need to contact our support team.
              </p>
              <p>
                All your data will be preserved and restored when you reactivate.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateAccount}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? 'Deactivating...' : 'Yes, Deactivate Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >

      {/* Delete Account Dialog */}
      < AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Permanently Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-red-600">
                This action is permanent and cannot be undone!
              </p>
              <p>
                All your data including:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Profile information</li>
                <li>Order history</li>
                <li>Shopping cart</li>
                <li>Saved addresses</li>
                <li>Reviews and ratings</li>
              </ul>
              <p>
                will be permanently deleted from our system.
              </p>
              <div className="pt-2">
                <Label htmlFor="confirm-email" className="text-sm font-semibold">
                  Type your email to confirm: <span className="text-red-600">{user?.email}</span>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Enter your email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  className="mt-2"
                  disabled={actionLoading}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={actionLoading}
              onClick={() => setDeleteConfirmEmail('')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={actionLoading || deleteConfirmEmail !== user?.email}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </div >
  );
}
