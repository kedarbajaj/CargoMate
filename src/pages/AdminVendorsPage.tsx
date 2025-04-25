
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Building, Edit, Trash, Plus } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Vendor {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  created_at: string;
}

const AdminVendorsPage = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error(t('admin.errorFetchingVendors'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm(t('admin.confirmDeleteVendor'))) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);
      
      if (error) throw error;
      
      setVendors(vendors.filter(vendor => vendor.id !== vendorId));
      toast.success(t('admin.vendorDeleted'));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(t('admin.errorDeletingVendor'));
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentVendor({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVendor({ ...currentVendor, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update({
            company_name: currentVendor.company_name,
            email: currentVendor.email,
            phone: currentVendor.phone
          })
          .eq('id', currentVendor.id);
        
        if (error) throw error;
        
        setVendors(vendors.map(vendor => 
          vendor.id === currentVendor.id ? { ...vendor, ...currentVendor } as Vendor : vendor
        ));
        
        toast.success(t('admin.vendorUpdated'));
      } else {
        // Add new vendor
        const { data, error } = await supabase
          .from('vendors')
          .insert({
            company_name: currentVendor.company_name,
            email: currentVendor.email,
            phone: currentVendor.phone
          })
          .select();
        
        if (error) throw error;
        
        setVendors([...(data || []), ...vendors]);
        toast.success(t('admin.vendorAdded'));
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(isEditing ? t('admin.errorUpdatingVendor') : t('admin.errorAddingVendor'));
    }
  };

  const filteredVendors = vendors.filter(vendor => 
    vendor.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold mb-2">{t('admin.manageVendors')}</h1>
          <p className="text-muted-foreground">{t('admin.manageVendorsSubtitle')}</p>
        </div>
        <Button 
          className="mt-2 md:mt-0 flex items-center gap-2"
          onClick={handleOpenAddDialog}
        >
          <Plus size={16} />
          {t('admin.addVendor')}
        </Button>
      </div>

      <Card className="bg-[#FAF3E0] border-[#C07C56] mb-6">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('admin.vendorsList')}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              placeholder={t('admin.searchVendors')}
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
                  <th className="text-left py-3 px-4">{t('admin.companyName')}</th>
                  <th className="text-left py-3 px-4">{t('admin.email')}</th>
                  <th className="text-left py-3 px-4">{t('admin.phone')}</th>
                  <th className="text-left py-3 px-4">{t('admin.createdAt')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-[#C07C56]/20 hover:bg-[#C07C56]/5">
                    <td className="py-3 px-4 flex items-center">
                      <Building size={16} className="mr-2 text-[#C07C56]" />
                      {vendor.company_name}
                    </td>
                    <td className="py-3 px-4">{vendor.email}</td>
                    <td className="py-3 px-4">{vendor.phone}</td>
                    <td className="py-3 px-4">{new Date(vendor.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEditDialog(vendor)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteVendor(vendor.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('admin.editVendor') : t('admin.addVendor')}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? t('admin.editVendorDescription') : t('admin.addVendorDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="company_name" className="text-sm font-medium mb-1 block">
                  {t('admin.companyName')}
                </label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={currentVendor.company_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">
                  {t('admin.email')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentVendor.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium mb-1 block">
                  {t('admin.phone')}
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={currentVendor.phone || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {isEditing ? t('common.save') : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendorsPage;
