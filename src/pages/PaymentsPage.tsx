
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Define payment method type
type PaymentMethod = 'CreditCard' | 'UPI' | 'NetBanking' | 'COD';

const PaymentsPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CreditCard');
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Payment processed successfully using ${paymentMethod}`);
      setIsProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('payments.title')}</h1>
      <p className="text-muted-foreground">{t('payments.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹25,000</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPaid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹19,500</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.pendingPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹5,500</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Payment Method Selection */}
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.selectMethod')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit}>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={handlePaymentMethodChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white p-3 rounded-md">
                  <RadioGroupItem value="CreditCard" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                    {t('payments.creditCard')}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-md">
                  <RadioGroupItem value="UPI" id="upi" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer">
                    {t('payments.upi')}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-md">
                  <RadioGroupItem value="NetBanking" id="net-banking" />
                  <Label htmlFor="net-banking" className="flex-1 cursor-pointer">
                    Net Banking
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-md">
                  <RadioGroupItem value="COD" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    Cash on Delivery (COD)
                  </Label>
                </div>
              </RadioGroup>
              
              <Button 
                type="submit" 
                className="w-full mt-4 bg-[#C07C56] hover:bg-[#6F4E37] text-white"
                disabled={isProcessing}
              >
                {isProcessing ? t('common.loading') : t('payments.completePayment')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dummy Payment History */}
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.paymentHistory')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#C07C56]/20">
                    <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.date')}</th>
                    <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.amount')}</th>
                    <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.method')}</th>
                    <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#C07C56]/20 bg-white">
                    <td className="py-3 px-4">2025-04-20</td>
                    <td className="py-3 px-4">₹4,500</td>
                    <td className="py-3 px-4">UPI</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#C07C56]/20 bg-white">
                    <td className="py-3 px-4">2025-04-15</td>
                    <td className="py-3 px-4">₹7,000</td>
                    <td className="py-3 px-4">Credit Card</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#C07C56]/20 bg-white">
                    <td className="py-3 px-4">2025-04-10</td>
                    <td className="py-3 px-4">₹3,000</td>
                    <td className="py-3 px-4">Net Banking</td>
                    <td className="py-3 px-4">
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#C07C56]/20 bg-white">
                    <td className="py-3 px-4">2025-04-05</td>
                    <td className="py-3 px-4">₹2,500</td>
                    <td className="py-3 px-4">UPI</td>
                    <td className="py-3 px-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                        Failed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;
