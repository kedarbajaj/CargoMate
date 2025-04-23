
import React from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface DeliveryInvoiceProps {
  invoiceData: {
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
  };
  onDownload?: () => void;
}

const getPackageTypePrice = (packageType: string, weightKg: number): number => {
  const basePrice = 100; // Base price in rupees
  const weightPrice = weightKg * 20; // ₹20 per kg
  
  let packageMultiplier = 1;
  switch (packageType) {
    case 'handle_with_care':
      packageMultiplier = 1.2;
      break;
    case 'fragile':
      packageMultiplier = 1.5;
      break;
    case 'oversized':
      packageMultiplier = 2;
      break;
    default: // standard
      packageMultiplier = 1;
  }
  
  return (basePrice + weightPrice) * packageMultiplier;
};

const DeliveryInvoice: React.FC<DeliveryInvoiceProps> = ({ invoiceData, onDownload }) => {
  const amount = invoiceData.amount || getPackageTypePrice(invoiceData.package_type, invoiceData.weight_kg);
  const gstRate = 0.18; // 18% GST
  const gstAmount = amount * gstRate;
  const totalAmount = amount + gstAmount;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto" id="invoice">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary">CargoMate</h1>
          <p className="text-sm text-gray-600">Delivery Services</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">INVOICE</h2>
          <p className="text-sm text-gray-600">#{invoiceData.id.substring(0, 8)}</p>
          <p className="text-sm text-gray-600">Date: {formatDate(invoiceData.created_at)}</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase">From</h3>
          <p className="font-medium">CargoMate Delivery Services</p>
          <p>123 Logistics Avenue</p>
          <p>Mumbai, Maharashtra 400001</p>
          <p>India</p>
          <p>GSTIN: 27AABCC1234A1Z5</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Bill To</h3>
          <p className="font-medium">{invoiceData.user.name}</p>
          <p>{invoiceData.user.email}</p>
          <p>{invoiceData.user.phone}</p>
        </div>
      </div>
      
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Delivery Details</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Pickup Address:</span>
              <p>{invoiceData.pickup_address}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Delivery Address:</span>
              <p>{invoiceData.drop_address}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Package Type:</span>
              <p className="capitalize">{invoiceData.package_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Weight:</span>
              <p>{invoiceData.weight_kg} kg</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4">Delivery charges - {invoiceData.package_type.replace('_', ' ')}</td>
              <td className="py-4 text-right">{formatCurrency(amount, 'INR')}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="py-2">GST (18%)</td>
              <td className="py-2 text-right">{formatCurrency(gstAmount, 'INR')}</td>
            </tr>
            <tr className="border-t border-b">
              <td className="py-4 font-semibold">Total</td>
              <td className="py-4 text-right font-semibold">{formatCurrency(totalAmount, 'INR')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-12">
        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Payment Information</h3>
        <p className="text-sm">Please make payment within 15 days to the bank account below:</p>
        <div className="bg-gray-50 p-4 rounded-md mt-2">
          <p><span className="font-medium">Bank Name:</span> ICICI Bank</p>
          <p><span className="font-medium">Account Name:</span> CargoMate Delivery Services</p>
          <p><span className="font-medium">Account Number:</span> XXXXXXXXXXXX1234</p>
          <p><span className="font-medium">IFSC Code:</span> ICIC0001234</p>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-600">
        <p>Thank you for choosing CargoMate Delivery Services!</p>
        <p>For any queries, please contact us at support@cargomate.com</p>
      </div>
      
      {onDownload && (
        <div className="mt-8 text-center">
          <button
            onClick={onDownload}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Download Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryInvoice;
