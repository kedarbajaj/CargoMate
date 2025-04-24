
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

type PaymentMethod = 'CreditCard' | 'UPI' | 'NetBanking' | 'COD';

interface PaymentComponentProps {
  deliveryId?: string;
  amount: number;
  onSuccess?: () => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  deliveryId, 
  amount, 
  onSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CreditCard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [upiId, setUpiId] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the payment form based on selected payment method
    if (paymentMethod === 'CreditCard') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCVC) {
        toast.error(t('payments.fillCardDetails'));
        return;
      }
    } else if (paymentMethod === 'UPI' && !upiId) {
      toast.error(t('payments.fillUpiDetails'));
      return;
    }

    try {
      setIsProcessing(true);
      
      // Process payment using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          deliveryId: deliveryId || '',
          amount,
          paymentMethod,
        },
      });

      if (error) throw error;
      
      toast.success(t('payments.paymentSuccess'));
      
      // Clear payment form
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCVC('');
      setUpiId('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t('payments.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  const formatCardNumber = (input: string) => {
    // Remove non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    
    // Format with spaces every 4 digits
    const parts = [];
    for (let i = 0; i < limitedDigits.length; i += 4) {
      parts.push(limitedDigits.substring(i, i + 4));
    }
    
    return parts.join(' ');
  };

  const formatExpiry = (input: string) => {
    // Remove non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
  };

  return (
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
          
          {/* Payment Method specific form fields */}
          {paymentMethod === 'CreditCard' && (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="cardNumber">{t('payments.cardNumber')}</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="bg-white border-[#C07C56] mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cardName">{t('payments.cardName')}</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white border-[#C07C56] mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">{t('payments.cardExpiry')}</Label>
                  <Input
                    id="cardExpiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="bg-white border-[#C07C56] mt-1"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardCVC">{t('payments.cardCVC')}</Label>
                  <Input
                    id="cardCVC"
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="bg-white border-[#C07C56] mt-1"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'UPI' && (
            <div className="mt-6">
              <Label htmlFor="upiId">{t('payments.upiId')}</Label>
              <Input
                id="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
                className="bg-white border-[#C07C56] mt-1"
              />
            </div>
          )}
          
          <div className="mt-6 bg-white p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span>{t('payments.amount')}</span>
              <span>₹{amount}</span>
            </div>
            <div className="flex justify-between mb-2 font-medium">
              <span>{t('payments.taxes')}</span>
              <span>₹{Math.round(amount * 0.18)}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>{t('payments.total')}</span>
              <span>₹{Math.round(amount * 1.18)}</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-[#C07C56] hover:bg-[#6F4E37] text-white"
            disabled={isProcessing}
          >
            {isProcessing ? t('common.processing') : t('payments.completePayment')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentComponent;
