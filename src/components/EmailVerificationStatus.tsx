
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EmailVerificationStatusProps {
  isEmailSent: boolean;
  email?: string;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({ isEmailSent, email }) => {
  if (!isEmailSent) return null;
  
  return (
    <Alert variant="info" className="my-4">
      <Info className="h-4 w-4" />
      <AlertTitle>Check your inbox</AlertTitle>
      <AlertDescription>
        A verification link has been sent to {email ? <strong>{email}</strong> : 'your email address'}.
        Please check your inbox and follow the link to complete your registration.
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationStatus;
