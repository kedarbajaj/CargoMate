
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export interface InvoiceData {
  id: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  pickup_address: string;
  drop_address: string;
  weight_kg: number;
  package_type: string;
  amount: number;
}

interface DeliveryInvoiceProps {
  data: InvoiceData;
}

const DeliveryInvoice: React.FC<DeliveryInvoiceProps> = ({ data }) => {
  const { t } = useTranslation();
  
  const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    const opt = {
      margin: 1,
      filename: `invoice-${data.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
  
  // Calculate taxes and total
  const taxes = data.amount * 0.18;
  const total = data.amount + taxes;
  
  // Format date
  const formattedDate = new Date(data.created_at).toLocaleDateString();
  
  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleDownload}
          className="bg-[#C07C56] hover:bg-[#6F4E37]"
        >
          {t('invoice.download')}
        </Button>
      </div>
      
      <Card className="bg-white border-[#C07C56]">
        <CardContent className="p-6" id="invoice-content">
          <div className="flex flex-col space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between border-b border-[#C07C56] pb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#6F4E37]">{t('invoice.invoice')}</h1>
                <p className="text-gray-600">{t('invoice.date')}: {formattedDate}</p>
                <p className="text-gray-600">#{data.id.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold text-[#6F4E37]">CargoMate</h2>
                <p>123 Delivery Lane</p>
                <p>Mumbai, Maharashtra</p>
                <p>India, 400001</p>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#6F4E37]">{t('invoice.from')}</h3>
                <p>CargoMate Delivery Services</p>
                <p>support@cargomate.com</p>
                <p>+91 98765 43210</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-[#6F4E37]">{t('invoice.billTo')}</h3>
                <p>{data.user.name}</p>
                <p>{data.user.email}</p>
                <p>{data.user.phone}</p>
              </div>
            </div>
            
            {/* Delivery Details */}
            <div>
              <h3 className="text-lg font-semibold text-[#6F4E37] mb-2">{t('invoice.deliveryDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">{t('invoice.pickupAddress')}:</p>
                  <p>{data.pickup_address}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('invoice.deliveryAddress')}:</p>
                  <p>{data.drop_address}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('invoice.packageType')}:</p>
                  <p>{data.package_type}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('invoice.weight')}:</p>
                  <p>{data.weight_kg} kg</p>
                </div>
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#FAF3E0]">
                  <tr>
                    <th className="text-left p-3">{t('invoice.description')}</th>
                    <th className="text-right p-3">{t('invoice.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">Delivery Service - {data.package_type} ({data.weight_kg} kg)</td>
                    <td className="text-right p-3">₹{data.amount.toFixed(2)}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">{t('invoice.gst')}</td>
                    <td className="text-right p-3">₹{taxes.toFixed(2)}</td>
                  </tr>
                  <tr className="border-t bg-[#FAF3E0]">
                    <td className="p-3 font-semibold">{t('invoice.total')}</td>
                    <td className="text-right p-3 font-semibold">₹{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-semibold text-[#6F4E37] mb-2">{t('invoice.paymentInfo')}</h3>
              <p>{t('invoice.paymentTerms')}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <p><span className="font-medium">{t('invoice.bankName')}:</span> HDFC Bank</p>
                <p><span className="font-medium">{t('invoice.accountName')}:</span> CargoMate Services</p>
                <p><span className="font-medium">{t('invoice.accountNumber')}:</span> XXXX XXXX XXXX 1234</p>
                <p><span className="font-medium">{t('invoice.ifscCode')}:</span> HDFC0001234</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center border-t border-[#C07C56] pt-4">
              <p className="font-semibold text-[#6F4E37]">{t('invoice.thankYou')}</p>
              <p className="text-sm text-gray-600">{t('invoice.contactUs')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryInvoice;
