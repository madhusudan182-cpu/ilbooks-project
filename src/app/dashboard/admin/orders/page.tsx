'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, User as UserIcon, ArrowLeft, CheckCircle2, Truck, Clock } from 'lucide-react';
import type { Order, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { mockUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const ordersQuery = useMemo(() => (firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null), [firestore]);
    const { data: orders, loading } = useCollection<Order>(ordersQuery);

    const usersById = useMemo(() => mockUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>), []);

    const handleStatusChange = (orderId: string, newStatus: 'Shipped' | 'Delivered') => {
        if (!firestore) return;
        const orderRef = doc(firestore, 'orders', orderId);
        const updateData = { status: newStatus };
        
        updateDoc(orderRef, updateData)
            .then(() => {
                 toast({ title: `Order marked as ${newStatus}` });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: orderRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'Paid': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">New Order</Badge>;
            case 'Shipped': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Transit</Badge>;
            case 'Delivered': return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const filteredOrders = (status?: Order['status']) => {
        if (!orders) return [];
        if (!status) return orders;
        return orders.filter(o => o.status === status);
    };

    if (loading || !isClient) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const counts = {
        all: orders?.length || 0,
        paid: orders?.filter(o => o.status === 'Paid').length || 0,
        shipped: orders?.filter(o => o.status === 'Shipped').length || 0,
        delivered: orders?.filter(o => o.status === 'Delivered').length || 0,
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin Panel
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <Package className="w-8 h-8 text-primary" />
                        Book Fulfillment
                    </CardTitle>
                    <CardDescription>
                        Manage incoming orders and track delivery status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="paid" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="all" className="relative">
                                All ({counts.all})
                            </TabsTrigger>
                            <TabsTrigger value="paid" className="relative">
                                New ({counts.paid})
                                {counts.paid > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3 bg-red-500 rounded-full" />}
                            </TabsTrigger>
                            <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
                            <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
                        </TabsList>

                        {['all', 'Paid', 'Shipped', 'Delivered'].map((status) => (
                            <TabsContent key={status} value={status.toLowerCase()} className="space-y-4">
                                {filteredOrders(status === 'all' ? undefined : status as Order['status']).length === 0 ? (
                                    <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                                        <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                        <p className="text-muted-foreground italic text-lg">No {status === 'all' ? '' : status.toLowerCase()} orders found.</p>
                                    </div>
                                ) : (
                                    <Accordion type="multiple" className="w-full space-y-3">
                                        {filteredOrders(status === 'all' ? undefined : status as Order['status']).map(order => {
                                            const user = usersById[order.userId];
                                            return (
                                                <AccordionItem value={order.id} key={order.id} className="border rounded-lg bg-card px-4">
                                                    <AccordionTrigger className="hover:no-underline py-4">
                                                        <div className="flex justify-between items-center w-full pr-4">
                                                            <div className="flex items-center gap-4 text-left">
                                                                <div className={cn(
                                                                    "h-12 w-12 hidden sm:flex items-center justify-center rounded-full shrink-0",
                                                                    order.status === 'Paid' ? "bg-yellow-100 text-yellow-600" :
                                                                    order.status === 'Shipped' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                                                                )}>
                                                                    {order.status === 'Paid' ? <Clock className="w-6 h-6" /> :
                                                                     order.status === 'Shipped' ? <Truck className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                                                </div>
                                                                <div className="grid gap-0.5">
                                                                    <p className="font-bold text-lg leading-none">{order.customerName}</p>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <span>{user?.name || `ID: ${order.userId}`}</span>
                                                                        <span>&bull;</span>
                                                                        <span className="font-mono">{order.mobileNumber}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-1">
                                                                <p className="font-black text-xl text-primary leading-none">Tk {order.totalAmount}</p>
                                                                {getStatusBadge(order.status)}
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-6">
                                                        <div className="grid md:grid-cols-2 gap-8 border-t pt-6 mt-2">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Delivery Address</h4>
                                                                    <p className="text-base font-medium p-3 bg-muted/30 rounded-md border italic">
                                                                        {order.deliveryAddress}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {order.status === 'Paid' && (
                                                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(order.id, 'Shipped')}>
                                                                            <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                                                                        </Button>
                                                                    )}
                                                                    {order.status === 'Shipped' && (
                                                                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(order.id, 'Delivered')}>
                                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Delivered
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="outline" asChild size="icon" title="View Profile">
                                                                        <Link href={`/dashboard/user/${order.userId}`}>
                                                                            <UserIcon className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Items Summary</h4>
                                                                <div className="border rounded-md overflow-hidden">
                                                                    <Table>
                                                                        <TableHeader className="bg-muted/50">
                                                                            <TableRow>
                                                                                <TableHead className="h-8 py-0">Book</TableHead>
                                                                                <TableHead className="h-8 py-0 text-center">Qty</TableHead>
                                                                                <TableHead className="h-8 py-0 text-right">Price</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {order.books.map(book => (
                                                                                <TableRow key={book.id} className="hover:bg-transparent">
                                                                                    <TableCell className="py-2">
                                                                                        <p className="font-semibold text-xs leading-tight">{book.title}</p>
                                                                                        <p className="text-[10px] text-muted-foreground">{book.author}</p>
                                                                                    </TableCell>
                                                                                    <TableCell className="py-2 text-center text-xs">{book.quantity}</TableCell>
                                                                                    <TableCell className="py-2 text-right text-xs">Tk {book.price * book.quantity}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                            <TableRow className="bg-primary/5 font-bold">
                                                                                <TableCell colSpan={2} className="py-2 text-xs">Fulfillment Total</TableCell>
                                                                                <TableCell className="py-2 text-right text-xs">Tk {order.totalAmount}</TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                                                    Order Date: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleString() : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
