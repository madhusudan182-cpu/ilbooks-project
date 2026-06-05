'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareQuote, Send, X } from "lucide-react";
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { currentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ComplainPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [type, setType] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !content.trim() || !firestore) return;

    setIsSubmitting(true);
    const newTicket = {
      userId: currentUser.id,
      userName: currentUser.name,
      type: type,
      content: content.trim(),
      status: 'Open',
      createdAt: serverTimestamp(),
    };

    const ticketsRef = collection(firestore, 'support_tickets');

    addDoc(ticketsRef, newTicket)
      .then(() => {
        toast({
          title: "Inquiry Sent",
          description: "Your message has been received. We will get back to you soon.",
        });
        router.push('/dashboard');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'support_tickets',
          operation: 'create',
          requestResourceData: newTicket,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-xl shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageSquareQuote className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Complain & Report</CardTitle>
          <CardDescription>
            Have a question or a complaint? Select a category and let us know.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Choose Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Competition">Competition</SelectItem>
                  <SelectItem value="Book Shop">Book Shop</SelectItem>
                  <SelectItem value="User Problem">User Problem</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Write your complain/question</Label>
              <Textarea 
                id="content" 
                placeholder="Type your message here..." 
                className="min-h-[150px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !type || !content.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Submit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
