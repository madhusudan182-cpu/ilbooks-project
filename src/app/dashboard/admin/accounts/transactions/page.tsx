'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Landmark, ArrowLeft, BookOpen, Crown, Trophy, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, X } from 'lucide-react';
import { mockTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, getMonth, setMonth, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type FilterType = Transaction['type'] | 'All Transactions';
type ViewMode = 'day' | 'month' | 'year' | 'total';

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminTransactionsPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [filter, setFilter] = useState<FilterType>('All Transactions');
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [summaryYear, setSummaryYear] = useState<number>(getYear(new Date()));
    const [viewMode, setViewMode] = useState<ViewMode>('day');

    useEffect(() => { setIsClient(true); }, []);

    const transactions = useMemo(() => {
        return [...mockTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, []);
    
    const filteredTransactions = useMemo(() => {
        const list = transactions.filter(t => {
            // Category Filter
            if (filter !== 'All Transactions' && t.type !== filter) return false;

            // Date Filter
            const tDate = new Date(t.date);
            if (viewMode === 'total') return true;
            if (viewMode === 'year') return getYear(tDate) === summaryYear;
            if (viewMode === 'month') return isSameMonth(tDate, selectedDate) && getYear(tDate) === getYear(selectedDate);
            return isSameDay(tDate, selectedDate);
        });

        let runningTotal = 0;
        return list.map(t => {
            runningTotal += t.amount;
            return { ...t, cumulative: runningTotal };
        });
    }, [transactions, filter, selectedDate, summaryYear, viewMode]);

    const getIconForType = (type: Transaction['type']) => {
        switch (type) {
            case 'Book Shop': return <BookOpen className="w-4 h-4" />;
            case 'Exam Fee': return <Trophy className="w-4 h-4" />;
            case 'Patronage': return <Crown className="w-4 h-4" />;
            default: return null;
        }
    }
    
    const filterButtons: { label: string; value: FilterType }[] = [
        { label: "All Transactions", value: "All Transactions" },
        { label: "Exam Fee", value: "Exam Fee" },
        { label: "Book Shop", value: "Book Shop" },
        { label: "Patronization", value: "Patronage" },
    ];

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => eachDayOfInterval({ start: subDays(selectedDate, 2), end: addDays(selectedDate, 2) }), [selectedDate]);

    if (!isClient) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard/admin')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Panel
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <Landmark className="w-8 h-8 text-primary" />
                        Money Transactions
                    </CardTitle>
                    <CardDescription>
                        View all incoming money from sales and fees.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="mb-6 space-y-4">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {filterButtons.map(({ label, value }) => (
                        <Button
                            key={value}
                            variant={filter === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Dual Navigation Bars */}
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
                        {viewMode === 'day' && `Transactions for: ${format(selectedDate, 'do MMMM, yyyy')}`}
                        {viewMode === 'month' && `Transactions for: ${format(selectedDate, 'MMMM yyyy')}`}
                        {viewMode === 'year' && `Transactions for the Year: ${summaryYear}`}
                        {viewMode === 'total' && `Lifetime Transaction Summary`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!filteredTransactions || filteredTransactions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-20 italic">No transactions found for this period.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Date</TableHead>
                                    <TableHead className="text-center">Type</TableHead>
                                    <TableHead className="text-center">User</TableHead>
                                    <TableHead className="text-right">Amount (Tk.)</TableHead>
                                    <TableHead className="text-right">Cumulative Amount (Tk.)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map(transaction => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="text-muted-foreground text-center">{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                {getIconForType(transaction.type)}
                                                <span className="text-xs">{transaction.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Link href={`/dashboard/user/${transaction.userId}`} className="hover:underline font-medium text-primary">
                                                {transaction.userName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-[#331362]">
                                            {transaction.cumulative.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

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
