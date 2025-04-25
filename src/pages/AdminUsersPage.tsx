
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, UserPlus, Edit, Trash } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vendor';
  created_at: string;
}

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure proper typing for role
      const typedUsers: User[] = (data || []).map(user => ({
        ...user,
        role: (user.role as 'user' | 'admin' | 'vendor') || 'user'
      }));
      
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('admin.errorFetchingUsers'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success(t('admin.userDeleted'));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('admin.errorDeletingUser'));
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'vendor') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success(t('admin.roleUpdated'));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(t('admin.errorUpdatingRole'));
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('admin.manageUsers')}</h1>
          <p className="text-muted-foreground">{t('admin.manageUsersSubtitle')}</p>
        </div>
        <Button className="mt-2 md:mt-0 flex items-center gap-2">
          <UserPlus size={16} />
          {t('admin.addUser')}
        </Button>
      </div>

      <Card className="bg-[#FAF3E0] border-[#C07C56] mb-6">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('admin.usersList')}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              placeholder={t('admin.searchUsers')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#C07C56]/20">
                  <th className="text-left py-3 px-4">{t('admin.name')}</th>
                  <th className="text-left py-3 px-4">{t('admin.email')}</th>
                  <th className="text-left py-3 px-4">{t('admin.phone')}</th>
                  <th className="text-left py-3 px-4">{t('admin.role')}</th>
                  <th className="text-left py-3 px-4">{t('admin.createdAt')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#C07C56]/20 hover:bg-[#C07C56]/5">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin' | 'vendor')}
                        className="px-2 py-1 border rounded bg-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
