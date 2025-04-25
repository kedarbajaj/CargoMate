
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, RefreshCw, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [isAutoAssignEnabled, setIsAutoAssignEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real application, this would save to a database
    toast.success(t('admin.settingsSaved'));
  };

  const handleRebuildCache = () => {
    // Simulate a cache rebuild
    toast.success(t('admin.cacheRebuilt'));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('admin.settings')}</h1>
          <p className="text-muted-foreground">{t('admin.settingsSubtitle')}</p>
        </div>
        <Button 
          className="mt-2 md:mt-0 flex items-center gap-2"
          onClick={handleSaveSettings}
        >
          <Save size={16} />
          {t('common.saveChanges')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#FAF3E0] border-[#C07C56]">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('admin.generalSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="companyName" className="text-sm font-medium mb-1 block">
                  {t('admin.companyName')}
                </label>
                <Input id="companyName" defaultValue="CargoMate" />
              </div>
              
              <div>
                <label htmlFor="supportEmail" className="text-sm font-medium mb-1 block">
                  {t('admin.supportEmail')}
                </label>
                <Input id="supportEmail" type="email" defaultValue="support@cargomate.com" />
              </div>
              
              <div>
                <label htmlFor="supportPhone" className="text-sm font-medium mb-1 block">
                  {t('admin.supportPhone')}
                </label>
                <Input id="supportPhone" defaultValue="+91 1234567890" />
              </div>
              
              <div>
                <label htmlFor="address" className="text-sm font-medium mb-1 block">
                  {t('admin.address')}
                </label>
                <Textarea id="address" rows={3} defaultValue="123 Logistics Way,&#10;Mumbai, Maharashtra 400001,&#10;India" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#FAF3E0] border-[#C07C56]">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('admin.deliverySettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="autoAssign" className="text-sm font-medium">
                  {t('admin.autoAssignDeliveries')}
                </label>
                <Switch 
                  id="autoAssign" 
                  checked={isAutoAssignEnabled}
                  onCheckedChange={setIsAutoAssignEnabled}
                />
              </div>
              
              <div>
                <label htmlFor="baseDeliveryRate" className="text-sm font-medium mb-1 block">
                  {t('admin.baseDeliveryRate')} (₹)
                </label>
                <Input id="baseDeliveryRate" type="number" defaultValue="100" />
              </div>
              
              <div>
                <label htmlFor="weightRateFactor" className="text-sm font-medium mb-1 block">
                  {t('admin.weightRateFactor')} (₹ per kg)
                </label>
                <Input id="weightRateFactor" type="number" defaultValue="10" />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="notificationsEnabled" className="text-sm font-medium">
                  {t('admin.enableDeliveryNotifications')}
                </label>
                <Switch 
                  id="notificationsEnabled" 
                  checked={isNotificationsEnabled}
                  onCheckedChange={setIsNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-[#FAF3E0] border-[#C07C56]">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('admin.systemSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="maintenanceMode" className="text-sm font-medium">
                  {t('admin.maintenanceMode')}
                </label>
                <Switch 
                  id="maintenanceMode" 
                  checked={isMaintenanceMode}
                  onCheckedChange={setIsMaintenanceMode}
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center"
                onClick={handleRebuildCache}
              >
                <RefreshCw size={16} />
                {t('admin.rebuildCache')}
              </Button>
              
              <div>
                <label htmlFor="logo" className="text-sm font-medium mb-1 block">
                  {t('admin.uploadLogo')}
                </label>
                <div className="flex gap-2">
                  <Input id="logo" type="file" className="flex-grow" />
                  <Button variant="ghost" size="icon">
                    <Upload size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#FAF3E0] border-[#C07C56]">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('admin.systemInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('admin.version')}:</span>
                  <span className="text-sm">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('admin.lastUpdate')}:</span>
                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('admin.environment')}:</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    {process.env.NODE_ENV || 'production'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
