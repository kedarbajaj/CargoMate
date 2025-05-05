
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { InvoiceData } from '@/types/delivery';
import { formatCurrency, formatDate } from '@/lib/formatUtils';
import InvoiceDownloader from './invoice/InvoiceDownloader';

interface DeliveryInvoiceProps {
  invoiceData: InvoiceData;
}

const DeliveryInvoice: React.FC<DeliveryInvoiceProps> = ({ invoiceData }) => {
  const { t } = useTranslation();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="space-y-4">
      <InvoiceDownloader invoiceData={invoiceData} invoiceRef={invoiceRef} />
      
      <div ref={invoiceRef} className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cargomate-600 dark:text-cargomate-400">
              {t('invoice.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('invoice.id')}: {invoiceData.id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{t('invoice.date')}:</p>
            <p className="text-sm text-gray-500">{formatDate(invoiceData.created_at)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">{t('invoice.customerDetails')}</h3>
              <p className="text-sm">{invoiceData.user.name}</p>
              <p className="text-sm">{invoiceData.user.email}</p>
              <p className="text-sm">{invoiceData.user.phone}</p>
              {invoiceData.user.current_address && (
                <p className="text-sm">{invoiceData.user.current_address}</p>
              )}
              {invoiceData.user.pincode && (
                <p className="text-sm">{t('invoice.pincode')}: {invoiceData.user.pincode}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">{t('invoice.shippingDetails')}</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">{t('delivery.pickupAddress')}:</p>
                  <p className="text-sm text-gray-500">{invoiceData.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('delivery.deliveryAddress')}:</p>
                  <p className="text-sm text-gray-500">{invoiceData.drop_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">{t('invoice.description')}</th>
                <th className="px-4 py-2 text-left">{t('invoice.details')}</th>
                <th className="px-4 py-2 text-right">{t('invoice.amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3">{t('invoice.deliveryService')}</td>
                <td className="px-4 py-3">
                  <div>
                    <p>{t('delivery.packageType')}: {t(`delivery.${invoiceData.package_type}`)}</p>
                    <p>{t('delivery.weight')}: {invoiceData.weight_kg} kg</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(invoiceData.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                <td className="px-4 py-3" colSpan={2}>{t('invoice.total')}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(invoiceData.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-500">
          <p>{t('invoice.thankYou')}</p>
          <p>{t('invoice.questions')}</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInvoice;
