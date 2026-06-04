
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowLeft, PlusCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Calendar } from 'lucide-react';
import { mockPrizeWinners, mockUsers, mockExamResults } from '@/lib/data';
import type { PrizeWinner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, getMonth, setMonth } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminPrizesPage() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newWinnerUserId, setNewWinnerUserId] = useState<string | null>(null);
    const [newWinnerPrize, setNewWinnerPrize] = useState('200');

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Combine manual and automated winners
    const allWinners = useMemo(() => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const userLevelAttempts: { [key: string]: number } = {};
        const chronoSortedResults = [...mockExamResults].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        const automaticWinners: (PrizeWinner & { date: string })[] = chronoSortedResults
            .map(result => {
                const key = `${result.userId}-${result.level}`;
                userLevelAttempts[key] = (userLevelAttempts[key] || 0) + 1;
                return { ...result, attemptNumber: userLevelAttempts[key] };
            })
            .filter(r => r.totalPercentage >= 80 && r.attemptNumber === 1)
            .map(r => ({
                id: `auto-${r.id}`,
                userId: r.userId,
                userName: r.userName,
                userAvatarUrl: r.userAvatarUrl,
                level: r.level,
                prize: 'Tk. 200', 
                status: 'Pending',
                date: r.examDate // Use exam date as winning date
            }));

        const manualWinners: (PrizeWinner & { date: string })[] = mockPrizeWinners.map(w => ({
            ...w,
            prize: w.prize.replace('BDT', 'Tk.').replace('Book Coupon', '').trim(),
            date: w.dateAwarded || todayStr // Default to today if not set
        }));

        return [...manualWinners, ...automaticWinners].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, []);

    const [winners, setWinners] = useState<(PrizeWinner & { date: string })[]>(allWinners);

    const handleMarkAsAwarded = (winnerId: string) => {
        setWinners(prevWinners => 
            prevWinners.map(winner => 
                winner.id === winnerId ? { ...winner, status: 'Awarded', dateAwarded: new Date().toISOString() } : winner
            )
        );
        toast({ title: "Prize status updated to 'Awarded'" });
    };

    const handleAddWinner = () => {
        if (!newWinnerUserId || !newWinnerPrize) {
            toast({ title: "Please select a user and enter a prize.", variant: "destructive" });
            return;
        }
        const user = mockUsers.find(u => u.id === newWinnerUserId);
        if (!user) return;

        const newWinner: PrizeWinner & { date: string } = {
            id: `prize-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatarUrl: user.avatarUrl,
            level: user.level.toFixed(1),
            prize: `Tk. ${newWinnerPrize}`,
            status: 'Pending',
            date: format(selectedDate, 'yyyy-MM-dd')
        };

        setWinners(prev => [...prev, newWinner].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        toast({ title: "New prize winner added." });
        setIsAddDialogOpen(false);
    };

    const getAmount = (p: string) => parseInt(p.replace(/[^\d]/g, ''), 10) || 0;

    // Calculate running total up to each entry in the full list
    const winnersWithCumulative = useMemo(() => {
        let runningTotal = 0;
        return winners.map(w => {
            runningTotal += getAmount(w.prize);
            return { ...w, cumulative: runningTotal };
        });
    }, [winners]);

    const filteredDisplay = useMemo(() => {
        return winnersWithCumulative.filter(w => isSameDay(new Date(w.date), selectedDate));
    }, [winnersWithCumulative, selectedDate]);

    // Navigation Helpers
    const handleFirstDayOfYear = () => setSelectedDate(startOfYear(selectedDate));
    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => {
        if (isAfter(addDays(selectedDate, 1), startOfToday())) return;
        setSelectedDate(prev => addDays(prev, 1));
    };
    const handleCurrentDay = () => setSelectedDate(startOfToday());
    const handleYearChange = (year: string) => setSelectedDate(prev => setYear(prev, parseInt(year)));
    const handleMonthClick = (monthIndex: number) => setSelectedDate(prev => setMonth(prev, monthIndex));

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => {
        const start = subDays(selectedDate, 2);
        const end = addDays(selectedDate, 2);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    if (!isClient) return null;

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

            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                            <Gift className="w-8 h-8 text-primary" />
                            Prizes & Gifts
                        </CardTitle>
                        <CardDescription>
                            Track prize distribution and expenditures.
                        </CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Winner
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Prize Winner</DialogTitle>
                                <DialogDescription>
                                    Set the prize amount for the selected user.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="user-select">User</Label>
                                    <Select onValueChange={setNewWinnerUserId}>
                                        <SelectTrigger id="user-select">
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockUsers.map(user => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} (Level: {user.level.toFixed(1)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="prize-input">Prize Amount (Tk.)</Label>
                                    <Input 
                                        id="prize-input" 
                                        type="number"
                                        value={newWinnerPrize}
                                        onChange={(e) => setNewWinnerPrize(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddWinner}>Add Winner</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
            </Card>

            {/* Year & Month Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex items-center border rounded-sm bg-card shadow-sm overflow-hidden">
                    <div className="px-3 py-2 border-r bg-muted/30 text-xs font-bold font-headline">Year:</div>
                    <Select value={getYear(selectedDate).toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-10 border-0 rounded-none shadow-none focus:ring-0 px-4 min-w-[80px] font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center border rounded-sm bg-card shadow-sm p-1 gap-1 overflow-x-auto no-scrollbar">
                    {monthsShort.map((m, i) => (
                        <Button 
                            key={m} 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                                "h-8 px-3 text-xs font-bold transition-all",
                                getMonth(selectedDate) === i ? "bg-primary text-white hover:bg-primary hover:text-white" : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={() => handleMonthClick(i)}
                        >
                            {m}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Date Navigation Bar */}
            <div className="flex items-center border rounded-sm w-full bg-card mb-6 shadow-sm overflow-hidden">
                <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0 hover:bg-muted" onClick={handleFirstDayOfYear} title="First day of year">
                    <ChevronsLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0 hover:bg-muted" onClick={handlePrevDay} title="Previous day">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 flex items-center h-12 overflow-x-auto no-scrollbar">
                    {dateRange.map(date => (
                        <div 
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "flex-1 h-full flex items-center justify-center border-r px-4 cursor-pointer text-sm font-bold whitespace-nowrap transition-all",
                                isSameDay(date, selectedDate) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {format(date, 'MMM d')}
                        </div>
                    ))}
                </div>

                <Button 
                    variant="ghost" 
                    className="rounded-none border-l h-12 w-12 px-0 hover:bg-muted" 
                    onClick={handleNextDay} 
                    disabled={isSameDay(selectedDate, startOfToday())}
                    title="Next day"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="rounded-none h-12 w-12 px-0 hover:bg-muted" onClick={handleCurrentDay} title="Today">
                    <ChevronsRight className="h-5 w-5" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">
                        Prizes for: {format(selectedDate, 'do MMMM, yyyy')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredDisplay.length === 0 ? (
                        <p className="text-muted-foreground text-center py-20 italic">No prizes found for this date.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Prize</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Cumulative Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDisplay.map(winner => (
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
                                        <TableCell className="font-bold">{winner.prize}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 items-start">
                                                <Badge
                                                    className={cn(winner.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}
                                                >
                                                    {winner.status}
                                                </Badge>
                                                {winner.status === 'Pending' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-6 px-2 text-[10px] uppercase font-bold"
                                                        onClick={() => handleMarkAsAwarded(winner.id)}
                                                    >
                                                        Mark
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-lg">
                                            Tk. {winner.cumulative.toLocaleString()}
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
