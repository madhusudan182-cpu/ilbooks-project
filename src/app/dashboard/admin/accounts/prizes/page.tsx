'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mockPrizeWinners } from '@/lib/data';
import type { PrizeWinner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminPrizesPage() {
    const [winners, setWinners] = useState(mockPrizeWinners);
    const { toast } = useToast();

    const handleMarkAsAwarded = (winnerId: string) => {
        setWinners(prevWinners => 
            prevWinners.map(winner => 
                winner.id === winnerId ? { ...winner, status: 'Awarded', dateAwarded: 'Just now' } : winner
            )
        );
        toast({ title: "Prize status updated to 'Awarded'" });
    };

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
                        <Gift className="w-8 h-8 text-primary" />
                        Prizes & Gifts
                    </CardTitle>
                    <CardDescription>
                        Manage and track prize distribution to winning users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!winners || winners.length === 0 ? (
                        <p className="text-muted-foreground text-center py-10">No prize winners found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Prize</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {winners.map(winner => (
                                    <TableRow key={winner.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={winner.userAvatarUrl} alt={winner.userName} />
                                                    <AvatarFallback>{winner.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Link href={`/dashboard/user/${winner.userId}`} className="font-semibold hover:underline">
                                                        {winner.userName}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">Level: {winner.level}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{winner.prize}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(winner.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}
                                            >
                                                {winner.status}
                                            </Badge>
                                            {winner.dateAwarded && (
                                                <p className="text-xs text-muted-foreground mt-1">{winner.dateAwarded}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {winner.status === 'Pending' && (
                                                <Button size="sm" onClick={() => handleMarkAsAwarded(winner.id)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Mark as Awarded
                                                </Button>
                                            )}
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
