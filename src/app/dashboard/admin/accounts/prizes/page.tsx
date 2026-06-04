
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowLeft, PlusCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ChevronDown } from 'lucide-react';
import { mockPrizeWinners, mockUsers, mockExamResults } from '@/lib/data';
import type { PrizeWinner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, getMonth, setMonth, isSameMonth } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ViewMode = 'day' | 'month' | 'year' | 'total';

export default function AdminPrizesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newWinnerUserId, setNewWinnerUserId] = useState<string | null>(null);
    const [newWinnerPrize, setNewWinnerPrize] = useState('200');

    useEffect(() => { setIsClient(true); }, []);

    const allWinnersInitial = useMemo(() => {
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
                date: r.examDate
            }));

        const manualWinners: (PrizeWinner & { date: string })[] = mockPrizeWinners.map(w => ({
            ...w, 
            prize: w.prize.replace('BDT', 'Tk.').replace('Book Coupon', '').trim(), 
            date: w.dateAwarded || todayStr
        }));

        return [...manualWinners, ...automaticWinners].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, []);

    const [winners, setWinners] = useState(allWinnersInitial);

    const handleMarkAsAwarded = (id: string) => {
        setWinners(prev => prev.map(w => w.id === id ? { ...w, status: 'Awarded', dateAwarded: new Date().toISOString() } : w));
        const { dismiss } = toast({ title: "Prize status updated to 'Awarded'" });
        setTimeout(dismiss, 3000);
    };

    const handleUpdatePrize = (id: string, amount: string) => setWinners(prev => prev.map(w => w.id === id ? { ...w, prize: `Tk. ${amount}` } : w));

    const handleAddWinner = () => {
        if (!newWinnerUserId || !newWinnerPrize) { 
            const { dismiss } = toast({ title: "Required fields missing", variant: "destructive" }); 
            setTimeout(dismiss, 3000);
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
        const { dismiss } = toast({ title: "Winner added." }); 
        setTimeout(dismiss, 3000);
        setIsAddDialogOpen(false);
    };

    const getAmount = (p: string) => parseInt(p.replace(/[^\d]/g, ''), 10) || 0;

    const filteredWinners = useMemo(() => {
        const list = winners.filter(w => {
            const wDate = new Date(w.date);
            if (viewMode === 'total') return true;
            if (viewMode === 'year') return getYear(wDate) === getYear(selectedDate);
            if (viewMode === 'month') return isSameMonth(wDate, selectedDate) && getYear(wDate) === getYear(selectedDate);
            return isSameDay(wDate, selectedDate);
        });

        let runningTotal = 0;
        let runningPaid = 0;
        let runningDue = 0;

        return list.map(w => { 
            const amount = getAmount(w.prize);
            runningTotal += amount;
            
            if (w.status === 'Awarded') {
                runningPaid += amount;
            } else {
                runningDue += amount;
            }

            return { 
                ...w, 
                cumulative: runningTotal,
                cumulativePaid: runningPaid,
                cumulativeDue: runningDue
            }; 
        });
    }, [winners, selectedDate, viewMode]);

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => eachDayOfInterval({ start: subDays(selectedDate, 2), end: addDays(selectedDate, 2) }), [selectedDate]);

    if (!isClient) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard/admin')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline"><Gift className="w-8 h-8 text-primary" /> Prizes & Gifts</CardTitle>
                    <CardDescription>Track expenditures and distribution.</CardDescription>
                </CardHeader>
            </Card>

            <div className="flex flex-wrap items-center gap-2 mb-4">
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
                                <DropdownMenuItem key={y} onClick={() => { setSelectedDate(prev => setYear(prev, parseInt(y))); setViewMode('year'); }}>
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
                <div className="flex items-center border rounded-sm w-full bg-card mb-6 shadow-sm overflow-hidden">
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

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-headline text-primary">
                        {viewMode === 'day' && `Prizes for: ${format(selectedDate, 'do MMMM, yyyy')}`}
                        {viewMode === 'month' && `Prizes for: ${format(selectedDate, 'MMMM yyyy')}`}
                        {viewMode === 'year' && `Prizes for the Year: ${getYear(selectedDate)}`}
                        {viewMode === 'total' && `Lifetime Prize Summary`}
                    </CardTitle>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Winner</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Prize Winner</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>User</Label>
                                    <Select onValueChange={setNewWinnerUserId}><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                                        <SelectContent>{mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name} (Level: {u.level.toFixed(1)})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Prize Amount (Tk.)</Label><Input type="number" value={newWinnerPrize} onChange={(e) => setNewWinnerPrize(e.target.value)} /></div>
                            </div>
                            <DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button><Button onClick={handleAddWinner}>Add</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {filteredWinners.length === 0 ? <p className="text-muted-foreground text-center py-20 italic">No records found.</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[#331362]">User</TableHead>
                                    <TableHead className="text-[#331362]">Prize</TableHead>
                                    <TableHead className="text-[#331362]">Status</TableHead>
                                    <TableHead className="text-[#331362]">Mark</TableHead>
                                    <TableHead className="text-right text-[#331362]">Paid (Tk.)</TableHead>
                                    <TableHead className="text-right text-[#331362]">Due (Tk.)</TableHead>
                                    <TableHead className="text-right text-[#331362]">Grand Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWinners.map(w => (
                                    <TableRow key={w.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={w.userAvatarUrl} />
                                                    <AvatarFallback>{w.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Link href={`/dashboard/user/${w.userId}`} className="font-bold text-[#331362] hover:underline">{w.userName}</Link>
                                                    <p className="text-xs text-muted-foreground">Level: {w.level}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-bold text-[#331362]">
                                                <span>Tk.</span>
                                                <input 
                                                    type="number" 
                                                    value={getAmount(w.prize)} 
                                                    onChange={(e) => handleUpdatePrize(w.id, e.target.value)} 
                                                    className="w-16 bg-transparent border-none focus:ring-0 focus:bg-muted/50 rounded px-1" 
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("text-[10px] h-5", w.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-[#FEF9C3] text-[#854D0E]')}>
                                                {w.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button 
                                                onClick={() => w.status === 'Pending' && handleMarkAsAwarded(w.id)} 
                                                className={cn(
                                                    "text-[10px] font-bold border rounded px-2 py-0.5 transition-all uppercase",
                                                    w.status === 'Awarded' 
                                                        ? 'text-green-600 border-green-600 cursor-default' 
                                                        : 'text-[#331362] border-[#331362] hover:bg-[#331362] hover:text-white'
                                                )}
                                            >
                                                {w.status === 'Awarded' ? 'MARKED' : 'MARK'}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right font-headline font-bold text-[#166534]">Tk. {w.cumulativePaid.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-headline font-bold text-[#991B1B]">Tk. {w.cumulativeDue.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-headline font-bold text-lg text-[#331362]">Tk. {w.cumulative.toLocaleString()}</TableCell>
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
