'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { HandCoins } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  productName: string;
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentGateway({ amount, productName, show, onClose, onSuccess }: PaymentGatewayProps) {
  const { toast } = useToast();

  const handlePaymentConfirmation = () => {
    toast({
      title: 'Payment Confirmation Pending',
      description: 'Thank you. We will verify your payment and proceed shortly.',
    });
    onSuccess();
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-primary" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription>
            Please follow the instructions below to complete your payment for "{productName}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Please send:</p>
                <p className="text-3xl font-bold font-mono text-primary">TK {amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">to our bKash/Rocket merchant number:</p>
                <p className="text-xl font-bold font-mono text-foreground tracking-widest bg-muted p-2 rounded-md mt-1">01758937021</p>
                <p className="text-xs text-muted-foreground mt-2">(Use your user ID as the reference if possible)</p>
            </div>
          <p className="text-xs text-center text-muted-foreground">
            After you have sent the money using your bKash or Rocket app, please click the button below.
          </p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePaymentConfirmation}>
            I Have Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
