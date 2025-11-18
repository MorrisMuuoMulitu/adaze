"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  ShoppingCart,
  Package,
  Star,
  Calendar,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Phone as PhoneIcon,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  full_name: string | null;
  email?: string;
  role: string;
  phone: string | null;
  location: string | null;
  created_at: string;
  is_suspended?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  suspended_at?: string | null;
  suspended_by?: string | null;
  last_login_at?: string | null;
  login_count?: number;
  avatar_url?: string | null;
}

interface UserStats {
  total_orders?: number;
  total_spent?: number;
  total_products?: number;
  total_reviews?: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    open: boolean;
    userId: string | null;
    currentRole: string | null;
    newRole: string | null;
  }>({
    open: false,
    userId: null,
    currentRole: null,
    newRole: null,
  });
  const [userDetailsDialog, setUserDetailsDialog] = useState<{
    open: boolean;
    user: User | null;
    stats: UserStats | null;
  }>({
    open: false,
    user: null,
    stats: null,
  });

  const supabase = createClient();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Get all profiles with user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch emails via API route (since we can't use admin API client-side)
      const response = await fetch('/api/admin/users');
      const emailData = await response.json();

      // Check if API returned an error
      if (!response.ok || emailData.error) {
        console.error('API Error:', JSON.stringify(emailData, null, 2));
        console.error('Error details:', emailData.details);
        console.error('Error message:', emailData.error);
        toast({
          title: 'Error',
          description: `Failed to fetch user emails: ${emailData.details || emailData.error}`,
          variant: 'destructive',
        });
        // Use profiles without emails as fallback
        setUsers((profiles || []).map((profile) => ({
          ...profile,
          email: 'N/A',
        })));
        setLoading(false);
        return;
      }

      const usersWithEmail = (profiles || []).map((profile) => {
        const emailInfo = emailData.find((u: any) => u.id === profile.id);
        return {
          ...profile,
          email: emailInfo?.email || 'N/A',
        };
      });

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      // Get current user (admin) ID
      const { data: { user } } = await supabase.auth.getUser();

      // Update user suspension status
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: suspend,
          suspended_at: suspend ? new Date().toISOString() : null,
          suspended_by: suspend ? (user?.id || 'admin') : null
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${suspend ? 'suspended' : 'activated'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete profile (this won't delete auth user, just the profile)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      setDeleteDialog({ open: false, userId: null });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = async () => {
    if (!roleChangeDialog.userId || !roleChangeDialog.newRole) return;

    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: roleChangeDialog.userId,
          role: roleChangeDialog.newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      setRoleChangeDialog({ open: false, userId: null, currentRole: null, newRole: null });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const fetchUserDetails = async (user: User) => {
    try {
      // Fetch user statistics
      const stats: UserStats = {};

      // Get order count and total spent (for buyers)
      if (user.role === 'buyer') {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('user_id', user.id);

        stats.total_orders = orders?.length || 0;
        stats.total_spent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      }

      // Get product count (for traders)
      if (user.role === 'trader') {
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('trader_id', user.id);

        stats.total_products = products?.length || 0;
      }

      // Get review count (for all users)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id);

      stats.total_reviews = reviews?.length || 0;

      setUserDetailsDialog({
        open: true,
        user,
        stats,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500 text-white';
      case 'trader':
        return 'bg-blue-500 text-white';
      case 'transporter':
        return 'bg-green-500 text-white';
      case 'buyer':
        return 'bg-yellow-500 text-white';
      case 'wholesaler':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="trader">Trader</SelectItem>
                <SelectItem value="transporter">Transporter</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Logins</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => fetchUserDetails(user)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.is_deleted ? (
                          <div className="space-y-0.5">
                            <Badge variant="destructive" className="bg-black text-white">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Deleted
                            </Badge>
                            {user.deleted_by && (
                              <div className="text-xs text-muted-foreground">
                                by: {user.deleted_by === 'self' ? 'User' : `Admin (${user.deleted_by.slice(0, 8)}...)`}
                              </div>
                            )}
                            {!user.deleted_by && (
                              <div className="text-xs text-muted-foreground">
                                by: Unknown
                              </div>
                            )}
                          </div>
                        ) : user.is_suspended ? (
                          <div className="space-y-0.5">
                            <Badge variant="destructive">
                              <UserX className="h-3 w-3 mr-1" />
                              Suspended
                            </Badge>
                            {user.suspended_by && (
                              <div className="text-xs text-muted-foreground">
                                by: {user.suspended_by === 'self' ? 'User' : `Admin (${user.suspended_by.slice(0, 8)}...)`}
                              </div>
                            )}
                            {!user.suspended_by && user.is_suspended && (
                              <div className="text-xs text-muted-foreground">
                                by: Unknown
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(user.last_login_at).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{user.login_count || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setRoleChangeDialog({
                                open: true,
                                userId: user.id,
                                currentRole: user.role,
                                newRole: null,
                              })
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          {user.is_suspended ? (
                            <DropdownMenuItem
                              onClick={() => handleSuspendUser(user.id, false)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleSuspendUser(user.id, true)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setDeleteDialog({ open: true, userId: user.id })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user&apos;s
              profile data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.userId && handleDeleteUser(deleteDialog.userId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog
        open={roleChangeDialog.open}
        onOpenChange={(open) =>
          setRoleChangeDialog({ ...roleChangeDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Current role: <strong>{roleChangeDialog.currentRole}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={roleChangeDialog.newRole || ''}
              onValueChange={(value) =>
                setRoleChangeDialog({ ...roleChangeDialog, newRole: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="trader">Trader</SelectItem>
                <SelectItem value="transporter">Transporter</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeRole}>
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsDialog.open}
        onOpenChange={(open) => setUserDetailsDialog({ ...userDetailsDialog, open })}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={userDetailsDialog.user?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {userDetailsDialog.user?.full_name?.charAt(0).toUpperCase() ||
                    userDetailsDialog.user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-bold">
                  {userDetailsDialog.user?.full_name || 'Unnamed User'}
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  Complete User Profile
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {userDetailsDialog.user && (
            <div className="space-y-6">
              {/* Status Alerts */}
              {userDetailsDialog.user.is_deleted && (
                <div className="p-4 bg-black/10 dark:bg-black/20 border border-black rounded-lg">
                  <div className="flex items-center gap-2 text-black dark:text-white font-semibold mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    Account Deleted
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Deleted by: <strong>
                      {!userDetailsDialog.user.deleted_by
                        ? 'Unknown (deleted before tracking was added)'
                        : userDetailsDialog.user.deleted_by === 'self'
                          ? 'User (Self-Deletion)'
                          : `Admin (ID: ${userDetailsDialog.user.deleted_by.slice(0, 8)}...)`}
                    </strong></p>
                    {userDetailsDialog.user.deleted_at && (
                      <p>Deleted on: <strong>{new Date(userDetailsDialog.user.deleted_at).toLocaleString()}</strong></p>
                    )}
                  </div>
                </div>
              )}

              {userDetailsDialog.user.is_suspended && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-semibold mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    Account Suspended
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <p>Suspended by: <strong>
                      {!userDetailsDialog.user.suspended_by
                        ? 'Unknown (suspended before tracking was added)'
                        : userDetailsDialog.user.suspended_by === 'self'
                          ? 'User (Self-Suspension)'
                          : `Admin (ID: ${userDetailsDialog.user.suspended_by.slice(0, 8)}...)`}
                    </strong></p>
                    {userDetailsDialog.user.suspended_at && (
                      <p>Suspended on: <strong>{new Date(userDetailsDialog.user.suspended_at).toLocaleString()}</strong></p>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                      <div className="font-medium">{userDetailsDialog.user.full_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">User ID</div>
                      <div className="font-mono text-xs">{userDetailsDialog.user.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                      <div className="font-medium">{userDetailsDialog.user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" />
                        Phone
                      </div>
                      <div className="font-medium">{userDetailsDialog.user.phone || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </div>
                      <div className="font-medium">{userDetailsDialog.user.location || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Role</div>
                      <Badge className={getRoleBadgeColor(userDetailsDialog.user.role)}>
                        {userDetailsDialog.user.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Account Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Account Created</div>
                      <div className="font-medium">
                        {new Date(userDetailsDialog.user.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.floor((Date.now() - new Date(userDetailsDialog.user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Last Login</div>
                      <div className="font-medium">
                        {userDetailsDialog.user.last_login_at
                          ? new Date(userDetailsDialog.user.last_login_at).toLocaleString()
                          : 'Never logged in'}
                      </div>
                      {userDetailsDialog.user.last_login_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.floor((Date.now() - new Date(userDetailsDialog.user.last_login_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Logins</div>
                      <div className="font-medium text-2xl">{userDetailsDialog.user.login_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current Status</div>
                      <div>
                        {userDetailsDialog.user.is_deleted ? (
                          <Badge variant="destructive" className="bg-black text-white">
                            Deleted
                          </Badge>
                        ) : userDetailsDialog.user.is_suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Statistics */}
              {userDetailsDialog.stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {userDetailsDialog.user.role === 'buyer' && (
                        <>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{userDetailsDialog.stats.total_orders || 0}</div>
                            <div className="text-xs text-muted-foreground">Total Orders</div>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <Package className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold">
                              KSh {(userDetailsDialog.stats.total_spent || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Spent</div>
                          </div>
                        </>
                      )}
                      {userDetailsDialog.user.role === 'trader' && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Package className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold">{userDetailsDialog.stats.total_products || 0}</div>
                          <div className="text-xs text-muted-foreground">Products Listed</div>
                        </div>
                      )}
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                        <div className="text-2xl font-bold">{userDetailsDialog.stats.total_reviews || 0}</div>
                        <div className="text-xs text-muted-foreground">Reviews Given</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setUserDetailsDialog({ open: false, user: null, stats: null })}
                >
                  Close
                </Button>
                {!userDetailsDialog.user.is_deleted && (
                  <Button
                    variant={userDetailsDialog.user.is_suspended ? "default" : "destructive"}
                    onClick={() => {
                      handleSuspendUser(userDetailsDialog.user!.id, !userDetailsDialog.user!.is_suspended);
                      setUserDetailsDialog({ open: false, user: null, stats: null });
                    }}
                  >
                    {userDetailsDialog.user.is_suspended ? 'Activate Account' : 'Suspend Account'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
