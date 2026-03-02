"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  UserCog, 
  ShieldAlert, 
  UserX,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error('Role update failed');
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Role update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center uppercase font-black tracking-widest text-[10px]">Accessing user directory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search directory..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none border-border/50 bg-background" 
          />
        </div>
      </div>

      <div className="border border-border/50 bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Ident</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Contact</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/5">
                <TableCell>
                  <div className="text-xs font-black uppercase tracking-tight">{user.name || 'Anonymous'}</div>
                  <div className="text-[9px] font-mono opacity-40">#{user.id.slice(0, 8)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-[10px] font-bold lowercase">{user.email}</div>
                  <div className="text-[9px] opacity-50">{user.location || 'No Location'}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-none text-[8px] font-black uppercase tracking-widest px-2">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border/50">
                      <DropdownMenuLabel className="text-[9px] font-black uppercase">Assign Role</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'BUYER')} className="text-[9px] uppercase font-bold">Buyer</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'TRADER')} className="text-[9px] uppercase font-bold">Trader</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'TRANSPORTER')} className="text-[9px] uppercase font-bold">Transporter</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'WHOLESALER')} className="text-[9px] uppercase font-bold">Wholesaler</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'ADMIN')} className="text-[9px] uppercase font-bold text-red-600">Admin</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
