'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const [ordersQuery, setOrdersQuery] = useState<any>(null);

    useEffect(() => {
        if (firestore) {
            setOrdersQuery(query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')));
        }
    }, [firestore]);
    
    const { data: orders, loading } = useCollection<Order>(ordersQuery);

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <Package className="w-8 h-8 text-primary" />
                        Customer Orders
                    </CardTitle>
                    <CardDescription>
                        View and manage all book orders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!orders || orders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-10">No orders found.</p>
                    ) : (
                        <Accordion type="multiple" className="w-full">
                            {orders.map(order => (
                                <AccordionItem value={order.id} key={order.id}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <div className="text-left">
                                                <p className="font-semibold">{order.customerName}</p>
                                                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">Tk {order.totalAmount}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold">Delivery Details</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Address: {order.deliveryAddress} <br />
                                                    Mobile: {order.mobileNumber}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Ordered Books</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Title</TableHead>
                                                            <TableHead>Author</TableHead>
                                                            <TableHead className="text-right">Price</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {order.books.map(book => (
                                                            <TableRow key={book.id}>
                                                                <TableCell>{book.title}</TableCell>
                                                                <TableCell>{book.author}</TableCell>
                                                                <TableCell className="text-right">Tk {book.price}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div>
                                                <Badge>{order.status}</Badge>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
