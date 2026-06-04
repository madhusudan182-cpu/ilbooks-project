'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, User as UserIcon, ArrowLeft, CheckCircle2, Truck, Clock, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { Order, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { mockUsers, mockOrders } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, getMonth, setMonth, isSameMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
type ViewMode = 'day' | 'month' | 'year' | 'total';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [summaryYear, setSummaryYear] = useState<number>(getYear(new Date()));
    const [viewMode, setViewMode] = useState<ViewMode>('day');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const ordersQuery = useMemo(() => (firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null), [firestore]);
    const { data: firestoreOrders, loading } = useCollection<Order>(ordersQuery);

    const allOrders = useMemo(() => {
        const firestoreList = firestoreOrders || [];
        const combined = [...firestoreList];
        mockOrders.forEach(mo => {
            if (!combined.some(fo => fo.id === mo.id)) {
                combined.push(mo as any);
            }
        });
        return combined.sort((a, b) => {
            const dateA = a.orderDate?.seconds || 0;
            const dateB = b.orderDate?.seconds || 0;
            return dateB - dateA;
        });
    }, [firestoreOrders]);

    const usersById = useMemo(() => mockUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>), []);

    const dateFilteredOrders = useMemo(() => {
        if (!allOrders) return [];
        return allOrders.filter(order => {
            const oDate = order.orderDate ? new Date(order.orderDate.seconds * 1000) : new Date();
            if (viewMode === 'total') return true;
            if (viewMode === 'year') return getYear(oDate) === summaryYear;
            if (viewMode === 'month') return isSameMonth(oDate, selectedDate) && getYear(oDate) === getYear(selectedDate);
            return isSameDay(oDate, selectedDate);
        });
    }, [allOrders, selectedDate, summaryYear, viewMode]);

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

    const getFilteredByStatus = (status?: Order['status']) => {
        if (!status) return dateFilteredOrders;
        return dateFilteredOrders.filter(o => o.status === status);
    };

    const counts = useMemo(() => ({
        all: dateFilteredOrders.length,
        paid: dateFilteredOrders.filter(o => o.status === 'Paid').length,
        shipped: dateFilteredOrders.filter(o => o.status === 'Shipped').length,
        delivered: dateFilteredOrders.filter(o => o.status === 'Delivered').length,
    }), [dateFilteredOrders]);

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => eachDayOfInterval({ start: subDays(selectedDate, 2), end: addDays(selectedDate, 2) }), [selectedDate]);

    if (!isClient) return null;

    if (loading && allOrders.length === 0) {
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
            </Card>

            <div className="space-y-4">
                {/* Navigation Bar 1: Year, Months, Yearly, Total */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center border rounded-sm bg-card shadow-sm overflow-hidden">
                        <div className="px-3 py-2 border-r bg-muted/30 text-xs font-bold font-headline text-[#331362]">Year:</div>
                        <Select value={getYear(selectedDate).toString()} onValueChange={val => setSelectedDate(prev => setYear(prev, parseInt(val)))}>
                            <SelectTrigger className="h-10 border-0 rounded-none shadow-none focus:ring-0 px-4 min-w-[80px] font-bold text-[#331362]"><SelectValue /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center border rounded-sm bg-card shadow-sm p-1 gap-1 overflow-x-auto no-scrollbar">
                        {monthsShort.map((m, i) => (
                            <Button key={m} variant="ghost" size="sm" className={cn("h-8 px-3 text-xs font-bold transition-all", (getMonth(selectedDate) === i && viewMode === 'month') ? "bg-primary text-white hover:bg-primary" : "text-muted-foreground")}
                                onClick={() => { setSelectedDate(prev => setMonth(prev, i)); setViewMode('month'); }}>{m}</Button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-1 border rounded-sm bg-card shadow-sm p-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={viewMode === 'year' ? "default" : "ghost"} size="sm" className="h-8 px-3 text-xs font-bold transition-all">
                                    Yearly <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {years.map(y => (
                                    <DropdownMenuItem key={y} onClick={() => { setSummaryYear(parseInt(y)); setViewMode('year'); }}>
                                        {y}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                            variant={viewMode === 'total' ? "default" : "ghost"} 
                            size="sm" 
                            className="h-8 px-3 text-xs font-bold transition-all"
                            onClick={() => setViewMode('total')}
                        >
                            Total
                        </Button>
                    </div>
                </div>

                {/* Navigation Bar 2: Day precision (Only in day view) */}
                {viewMode === 'day' && (
                    <div className="flex items-center border rounded-sm w-full bg-card shadow-sm overflow-hidden">
                        <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0" onClick={() => setSelectedDate(startOfYear(selectedDate))}><ChevronsLeft className="h-5 w-5" /></Button>
                        <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0" onClick={() => setSelectedDate(prev => subDays(prev, 1))}><ChevronLeft className="h-5 w-5" /></Button>
                        <div className="flex-1 flex items-center h-12 overflow-x-auto no-scrollbar">
                            {dateRange.map(date => (
                                <div key={date.toISOString()} onClick={() => { setSelectedDate(date); setViewMode('day'); }}
                                    className={cn("flex-1 h-full flex items-center justify-center border-r px-4 cursor-pointer text-sm font-bold whitespace-nowrap transition-all", isSameDay(date, selectedDate) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                                    {format(date, 'MMM d')}
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="rounded-none border-l h-12 w-12 px-0" onClick={() => !isAfter(addDays(selectedDate, 1), startOfToday()) && setSelectedDate(prev => addDays(prev, 1))} disabled={isSameDay(selectedDate, startOfToday())}><ChevronRight className="h-5 w-5" /></Button>
                        <Button variant="ghost" className="rounded-none h-12 w-12 px-0" onClick={() => setSelectedDate(startOfToday())}><ChevronsRight className="h-5 w-5" /></Button>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">
                        {viewMode === 'day' && `Orders for: ${format(selectedDate, 'do MMMM, yyyy')}`}
                        {viewMode === 'month' && `Orders for: ${format(selectedDate, 'MMMM yyyy')}`}
                        {viewMode === 'year' && `Orders for the Year: ${summaryYear}`}
                        {viewMode === 'total' && `Lifetime Order Summary`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
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
                                {getFilteredByStatus(status === 'all' ? undefined : status as Order['status']).length === 0 ? (
                                    <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                                        <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                        <p className="text-muted-foreground italic text-lg">No {status === 'all' ? '' : status.toLowerCase()} orders found for this period.</p>
                                    </div>
                                ) : (
                                    <Accordion type="multiple" className="w-full space-y-3">
                                        {getFilteredByStatus(status === 'all' ? undefined : status as Order['status']).map(order => {
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
                    {viewMode !== 'day' && (
                        <div className="mt-8 flex justify-center border-t pt-6">
                            <Button variant="outline" className="w-40 border-[#331362] text-[#331362] font-bold" onClick={() => setViewMode('day')}>
                                Back
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}