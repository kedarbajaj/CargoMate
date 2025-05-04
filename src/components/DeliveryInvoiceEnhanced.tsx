
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';
import { formatCurrency } from '@/lib/formatUtils';
import { Download } from 'lucide-react';

interface DeliveryDetails {
  id: string;
  pickup_address: string;
  drop_address: string;
  package_type: string;
  weight_kg: number;
  status: string;
  created_at: string;
}

interface PaymentDetails {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryInvoiceProps {
  delivery: DeliveryDetails;
  payment: PaymentDetails;
  user: UserDetails;
  companyDetails: {
    name: string;
    address: string;
    email: string;
    phone: string;
    bankDetails: {
      name: string;
      accountName: string;
      accountNumber: string;
      ifsc: string;
    };
  };
}

const DeliveryInvoiceEnhanced: React.FC<DeliveryInvoiceProps> = ({
  delivery,
  payment,
  user,
  companyDetails,
}) => {
  const { t } = useTranslation();
  const invoiceDate = new Date(delivery.created_at).toLocaleDateString();
  const invoiceNumber = `INV-${delivery.id.slice(0, 8).toUpperCase()}`;
  
  const subtotal = payment.amount / 1.18; // Removing GST for calculation
  const gstAmount = payment.amount - subtotal;
  
  const handleDownloadPDF = () => {
    const invoiceElement = document.getElementById('invoice-content');
    const opt = {
      margin: 10,
      filename: `invoice-${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Add a temporary class for PDF generation
    if (invoiceElement) {
      invoiceElement.classList.add('invoice-pdf-mode');
      html2pdf().from(invoiceElement).set(opt).save().then(() => {
        invoiceElement.classList.remove('invoice-pdf-mode');
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cargomate-600 dark:text-cargomate-400">{t('invoice.invoice')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{invoiceNumber}</p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-cargomate-500 to-cargomate-600 hover:from-cargomate-600 hover:to-cargomate-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {t('invoice.download')}
        </Button>
      </div>
      
      <div id="invoice-content" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-cargomate-500 dark:text-cargomate-400">{t('invoice.from')}</h2>
            <div className="mt-2 space-y-1">
              <p className="font-semibold">{companyDetails.name}</p>
              <p className="text-sm">{companyDetails.address}</p>
              <p className="text-sm">{companyDetails.email}</p>
              <p className="text-sm">{companyDetails.phone}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-cargomate-500 dark:text-cargomate-400">{t('invoice.billTo')}</h2>
            <div className="mt-2 space-y-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm">{user.email}</p>
              <p className="text-sm">{user.phone}</p>
            </div>
            
            <div className="mt-4">
              <p className="text-sm"><span className="font-semibold">{t('invoice.date')}:</span> {invoiceDate}</p>
              <p className="text-sm"><span className="font-semibold">{t('payments.status')}:</span> {payment.status}</p>
              <p className="text-sm"><span className="font-semibold">{t('payments.method')}:</span> {payment.payment_method}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-cargomate-500 dark:text-cargomate-400 mb-4">{t('invoice.deliveryDetails')}</h2>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('invoice.pickupAddress')}</p>
                <p className="font-medium">{delivery.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('invoice.deliveryAddress')}</p>
                <p className="font-medium">{delivery.drop_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('invoice.packageType')}</p>
                <p className="font-medium">{delivery.package_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('invoice.weight')}</p>
                <p className="font-medium">{delivery.weight_kg} kg</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-cargomate-500 dark:text-cargomate-400 mb-4">{t('invoice.paymentInfo')}</h2>
          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span>{t('delivery.deliveryCharge')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('invoice.gst')}</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t('invoice.total')}</span>
              <span className="text-cargomate-600 dark:text-cargomate-400">{formatCurrency(payment.amount)}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">{t('invoice.paymentTerms')}</h3>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700 space-y-2 text-sm">
            <p><span className="font-semibold">{t('invoice.bankName')}:</span> {companyDetails.bankDetails.name}</p>
            <p><span className="font-semibold">{t('invoice.accountName')}:</span> {companyDetails.bankDetails.accountName}</p>
            <p><span className="font-semibold">{t('invoice.accountNumber')}:</span> {companyDetails.bankDetails.accountNumber}</p>
            <p><span className="font-semibold">{t('invoice.ifscCode')}:</span> {companyDetails.bankDetails.ifsc}</p>
          </div>
        </div>
        
        <div className="text-center pt-6">
          <p className="font-medium text-cargomate-500">{t('invoice.thankYou')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('invoice.contactUs')}</p>
        </div>
        
        <div className="text-xs text-gray-400 text-center pt-4 border-t">
          <p>Invoice #{invoiceNumber} | Generated on {invoiceDate}</p>
        </div>
      </div>
      
      <style>
        {`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        .invoice-pdf-mode {
          background-color: white !important;
          color: black !important;
          padding: 20px;
        }
        `}
      </style>
    </div>
  );
};

export default DeliveryInvoiceEnhanced;
