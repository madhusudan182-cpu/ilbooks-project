
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquareQuote, CheckCircle2, Clock, User, Trash2 } from 'lucide-react';
import type { SupportTicket } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SupportTicketsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isClient, setIsClient] = useState(false);

    // Map URL slug to formal type used in database
    const slugToType: Record<string, string> = {
        'competition': 'Competition',
        'book-shop': 'Book Shop',
        'user-problem': 'User Problem',
        'others': 'Others'
    };

    const typeSlug = params.type as string;
    const formalType = slugToType[typeSlug] || 'Others';

    useEffect(() => { setIsClient(true); }, []);

    const ticketsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'support_tickets'),
            where('type', '==', formalType),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, formalType]);

    const { data: tickets, loading } = useCollection<SupportTicket>(ticketsQuery);

    const handleResolve = (ticketId: string) => {
        if (!firestore) return;
        const ticketRef = doc(firestore, 'support_tickets', ticketId);
        const updateData = { status: 'Resolved' };

        updateDoc(ticketRef, updateData)
            .then(() => toast({ title: "Ticket marked as resolved" }))
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: ticketRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    if (!isClient) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard/admin')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Panel
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <MessageSquareQuote className="w-8 h-8 text-primary" />
                        {formalType} Support
                    </CardTitle>
                    <CardDescription>
                        Review and manage inquiries for the {formalType} category.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {loading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                ) : !tickets || tickets.length === 0 ? (
                    <Card className="bg-muted/10 border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <CheckCircle2 className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground font-medium italic">No tickets found for this category.</p>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map(ticket => (
                        <Card key={ticket.id} className={ticket.status === 'Resolved' ? "opacity-60" : ""}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#331362] leading-none">{ticket.userName}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">ID: {ticket.userId}</p>
                                            </div>
                                            <Badge variant={ticket.status === 'Open' ? 'destructive' : 'outline'}>
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-md border text-sm italic">
                                            "{ticket.content}"
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 justify-between">
                                        <div className="text-right text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {ticket.createdAt ? format(new Date(ticket.createdAt.seconds * 1000), 'do MMM, p') : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/user/${ticket.userId}`}>View Profile</Link>
                                            </Button>
                                            {ticket.status === 'Open' && (
                                                <Button size="sm" onClick={() => handleResolve(ticket.id)}>
                                                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
