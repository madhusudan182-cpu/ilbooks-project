'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Landmark, ArrowLeft, BookOpen, Crown, Trophy } from 'lucide-react';
import { mockTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminTransactionsPage() {
    const transactions = mockTransactions;

    const getIconForType = (type: Transaction['type']) => {
        switch (type) {
            case 'Book Shop': return <BookOpen className="w-4 h-4" />;
            case 'Exam Fee': return <Trophy className="w-4 h-4" />;
            case 'Patronage': return <Crown className="w-4 h-4" />;
            default: return null;
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button asChild variant="ghost">
                  <Link href="/dashboard/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin Panel
                  </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <Landmark className="w-8 h-8 text-primary" />
                        Money Transactions
                    </CardTitle>
                    <CardDescription>
                        View all incoming money from sales and fees.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!transactions || transactions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-10">No transactions found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Amount (TK)</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(transaction => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="text-muted-foreground">{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {getIconForType(transaction.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/user/${transaction.userId}`} className="hover:underline">
                                                {transaction.userName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                className={cn(
                                                    transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                    transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                )}
                                            >
                                                {transaction.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
