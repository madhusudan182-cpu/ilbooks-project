'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, ShieldAlert, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, UserMinus, ShieldOff, Filter, X, Search } from 'lucide-react';
import { mockUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, getMonth, setMonth, isSameMonth, differenceInHours } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { thanasByDistrict } from '@/lib/location-data';

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
type ViewMode = 'day' | 'month' | 'year' | 'total';

const districts = Object.keys(thanasByDistrict);

export default function TotalUserPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [summaryYear, setSummaryYear] = useState<number>(getYear(new Date()));
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    
    // Filtering state
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterDistrict, setFilterDistrict] = useState<string>('all');
    const [filterThana, setFilterThana] = useState<string>('all');
    
    // Moderation state
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [moderatingUser, setModeratingUser] = useState<User | null>(null);
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            // Date Filter
            const uDate = new Date(u.signUpDate);
            let dateMatch = false;
            if (viewMode === 'total') dateMatch = true;
            else if (viewMode === 'year') dateMatch = getYear(uDate) === summaryYear;
            else if (viewMode === 'month') dateMatch = isSameMonth(uDate, selectedDate) && getYear(uDate) === getYear(selectedDate);
            else dateMatch = isSameDay(uDate, selectedDate);

            if (!dateMatch) return false;

            // Property Filters
            if (filterLevel !== 'all' && u.level.toFixed(1) !== filterLevel) return false;
            if (filterDistrict !== 'all' && !u.location.toLowerCase().includes(filterDistrict.toLowerCase())) return false;
            if (filterThana !== 'all' && !u.location.toLowerCase().includes(filterThana.toLowerCase())) return false;

            return true;
        }).sort((a, b) => new Date(b.signUpDate).getTime() - new Date(a.signUpDate).getTime());
    }, [users, selectedDate, summaryYear, viewMode, filterLevel, filterDistrict, filterThana]);

    const stats = useMemo(() => {
        const today = startOfToday();
        return {
            today: users.filter(u => isSameDay(new Date(u.signUpDate), today)).length,
            month: users.filter(u => isSameMonth(new Date(u.signUpDate), today) && getYear(new Date(u.signUpDate)) === getYear(today)).length,
            year: users.filter(u => getYear(new Date(u.signUpDate)) === getYear(today)).length,
            lifetime: users.length
        };
    }, [users]);

    const handleApplyPunishment = (type: '1day' | '3days' | '7days' | '30days' | 'forever') => {
        if (!moderatingUser) return;

        let banExpires: string | null = null;
        let isPermanentlyBanned = false;
        let durationText = "";
        let expiryDateText = "";

        const now = new Date();

        switch (type) {
            case '1day': 
                banExpires = addDays(now, 1).toISOString(); 
                durationText = "1 day";
                expiryDateText = format(addDays(now, 1), 'do MMMM, yyyy');
                break;
            case '3days': 
                banExpires = addDays(now, 3).toISOString(); 
                durationText = "3 days";
                expiryDateText = format(addDays(now, 3), 'do MMMM, yyyy');
                break;
            case '7days': 
                banExpires = addDays(now, 7).toISOString(); 
                durationText = "7 days";
                expiryDateText = format(addDays(now, 7), 'do MMMM, yyyy');
                break;
            case '30days': 
                banExpires = addDays(now, 30).toISOString(); 
                durationText = "30 days";
                expiryDateText = format(addDays(now, 30), 'do MMMM, yyyy');
                break;
            case 'forever': 
                isPermanentlyBanned = true; 
                durationText = "permanently";
                break;
        }

        setUsers(prev => prev.map(u => u.id === moderatingUser.id ? { 
            ...u, 
            banExpires, 
            isPermanentlyBanned 
        } : u));

        const professionalNotice = isPermanentlyBanned 
            ? `${moderatingUser.name}, your account has been permanently deactivated due to severe or repeated violations of our community standards.`
            : `${moderatingUser.name}, your account access has been restricted for ${durationText} following community reports regarding your recent interactions. Your privileges will be automatically restored on ${expiryDateText}.`;

        toast({
            title: "Restriction Applied & Notification Sent",
            description: professionalNotice,
            duration: 6000,
        });

        setIsModDialogOpen(false);
        setModeratingUser(null);
    };

    const getStatusBadge = (user: User) => {
        // Punishment status takes priority
        if (user.isPermanentlyBanned) return <Badge variant="destructive" className="bg-red-600">Banned Forever</Badge>;
        if (user.banExpires && isAfter(new Date(user.banExpires), new Date())) {
            return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">Blocked until {format(new Date(user.banExpires), 'MMM d')}</Badge>;
        }

        // Activity status
        if (!user.lastSeen) return <Badge variant="outline" className="border-gray-300 text-gray-500">Unknown</Badge>;
        
        const lastSeenDate = new Date(user.lastSeen);
        const now = new Date();
        const diffInHours = differenceInHours(now, lastSeenDate);
        
        if (diffInHours < 24) {
            return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 font-bold">Active</Badge>;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return <Badge variant="outline" className="border-gray-400 text-gray-600 bg-gray-50">Inactive for {diffInDays} days</Badge>;
        }
    };

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const levels = useMemo(() => {
        const list = [];
        for(let i = 0; i <= 19; i++) {
            for(let j = 0; j <= 9; j++) {
                list.push(`${i}.${j}`);
            }
        }
        return list;
    }, []);

    const dateRange = useMemo(() => eachDayOfInterval({ start: subDays(selectedDate, 2), end: addDays(selectedDate, 2) }), [selectedDate]);

    const resetFilters = () => {
        setFilterLevel('all');
        setFilterDistrict('all');
        setFilterThana('all');
    };

    if (!isClient) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="mb-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard/admin')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-3xl font-headline"><Users className="w-8 h-8 text-primary" /> Total User Management</CardTitle>
                            <CardDescription>Track growth and manage user access permissions.</CardDescription>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-primary/5 p-3 rounded-md border text-center">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Today</p>
                                <p className="text-xl font-black text-primary">+{stats.today}</p>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-md border text-center">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">This Month</p>
                                <p className="text-xl font-black text-primary">+{stats.month}</p>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-md border text-center">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">This Year</p>
                                <p className="text-xl font-black text-primary">+{stats.year}</p>
                            </div>
                            <div className="bg-[#331362]/5 p-3 rounded-md border text-center">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Lifetime</p>
                                <p className="text-xl font-black text-[#331362]">{stats.lifetime}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
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

                        <Button variant={viewMode === 'total' ? "default" : "ghost"} size="sm" className="h-8 px-3 text-xs font-bold transition-all" onClick={() => setViewMode('total')}>Total</Button>
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
                <CardHeader className="border-b pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-headline text-primary whitespace-nowrap">
                            {viewMode === 'day' && `Users joined on: ${format(selectedDate, 'do MMMM, yyyy')}`}
                            {viewMode === 'month' && `Users joined in: ${format(selectedDate, 'MMMM yyyy')}`}
                            {viewMode === 'year' && `Users joined in the Year: ${summaryYear}`}
                            {viewMode === 'total' && `Lifetime User Directory`}
                        </CardTitle>

                        {/* HORIZONTAL FILTER BAR */}
                        <div className="flex flex-row items-center gap-2 bg-muted/20 p-2 rounded-md border border-dashed border-primary/20">
                            <div className="flex items-center gap-2 mr-2">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase text-primary/70">Filters:</span>
                            </div>

                            <Select value={filterLevel} onValueChange={setFilterLevel}>
                                <SelectTrigger className="h-8 min-w-[100px] text-xs bg-background">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={filterDistrict} onValueChange={(val) => { setFilterDistrict(val); setFilterThana('all'); }}>
                                <SelectTrigger className="h-8 min-w-[120px] text-xs bg-background capitalize">
                                    <SelectValue placeholder="District" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {districts.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={filterThana} onValueChange={setFilterThana} disabled={filterDistrict === 'all'}>
                                <SelectTrigger className="h-8 min-w-[120px] text-xs bg-background capitalize">
                                    <SelectValue placeholder="Thana" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Thanas</SelectItem>
                                    {(thanasByDistrict[filterDistrict] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {(filterLevel !== 'all' || filterDistrict !== 'all' || filterThana !== 'all') && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-red-600" onClick={resetFilters}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-20 bg-muted/10 rounded-lg border-2 border-dashed">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground italic text-lg">No matches found for the selected criteria.</p>
                            <Button variant="link" onClick={resetFilters}>Reset all filters</Button>
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden mt-4">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>User Information</TableHead>
                                        <TableHead>Contact Details</TableHead>
                                        <TableHead className="text-center">Level</TableHead>
                                        <TableHead>Institution & Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map(user => (
                                        <TableRow key={user.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid gap-0.5">
                                                        <Link href={`/dashboard/user/${user.id}`} className="font-bold text-[#331362] hover:underline leading-none">
                                                            {user.name}
                                                        </Link>
                                                        <span className="text-[10px] text-muted-foreground font-mono">ID: {user.id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <p className="flex items-center gap-1.5"><span className="text-muted-foreground font-semibold w-8">Mail:</span> {user.email}</p>
                                                    <p className="flex items-center gap-1.5"><span className="text-muted-foreground font-semibold w-8">Mob:</span> {user.mobile || 'N/A'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="font-mono">{user.level.toFixed(1)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs max-w-[200px]">
                                                    <p className="font-medium truncate" title={user.institution}>{user.institution}</p>
                                                    <p className="text-muted-foreground truncate" title={user.location}>{user.location}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(user)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => { setModeratingUser(user); setIsModDialogOpen(true); }}>
                                                    <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Punish
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {viewMode !== 'day' && (
                        <div className="mt-8 flex justify-center border-t pt-6">
                            <Button variant="outline" className="w-40 border-[#331362] text-[#331362] font-bold" onClick={() => setViewMode('day')}>
                                Back to Calendar
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Punishment / Moderation Dialog */}
            <Dialog open={isModDialogOpen} onOpenChange={setIsModDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" /> Moderation Control
                        </DialogTitle>
                        <DialogDescription>
                            Applying restrictions for <strong>{moderatingUser?.name}</strong>. Banned users cannot participate in competitions or order books. Users will be unblocked automatically after the selected duration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start border-orange-200 hover:bg-orange-50" onClick={() => handleApplyPunishment('1day')}>
                                <ShieldOff className="mr-2 h-4 w-4" /> Block for 1 Day
                            </Button>
                            <Button variant="outline" className="justify-start border-orange-300 hover:bg-orange-50" onClick={() => handleApplyPunishment('3days')}>
                                <ShieldOff className="mr-2 h-4 w-4" /> Block for 3 Days
                            </Button>
                            <Button variant="outline" className="justify-start border-orange-400 hover:bg-orange-50" onClick={() => handleApplyPunishment('7days')}>
                                <ShieldOff className="mr-2 h-4 w-4" /> Block for 7 Days
                            </Button>
                            <Button variant="outline" className="justify-start border-orange-500 hover:bg-orange-50" onClick={() => handleApplyPunishment('30days')}>
                                <ShieldOff className="mr-2 h-4 w-4" /> Block for 30 Days
                            </Button>
                            <Button variant="destructive" className="justify-start bg-red-600 hover:bg-red-700 col-span-2" onClick={() => handleApplyPunishment('forever')}>
                                <UserMinus className="mr-2 h-4 w-4" /> Ban Permanently
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModDialogOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
