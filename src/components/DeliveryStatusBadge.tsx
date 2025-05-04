
import React from 'react';
import { Badge } from "@/components/ui/badge";

type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status, className }) => {
  const getVariant = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Badge className={`${getVariant()} ${className || ''} font-medium border`} variant="outline">
      {getLabel()}
    </Badge>
  );
};

export default DeliveryStatusBadge;
