
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User as UserIcon, X, History } from 'lucide-react';
import type { ExamResult } from '@/lib/types';
import { mockExamResults, mockUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ExamResultWithAttempt = ExamResult & { attemptNumber: number };

const DetailedResultTable = ({ result }: { result: ExamResult }) => (
    <div className="border rounded-lg overflow-hidden my-4 animate-fade-in-up">
        <h3 className="p-3 font-bold text-center text-md bg-muted">
            Result for Level {result.level} (Date: {format(new Date(result.examDate), 'dd/MM/yyyy')})
        </h3>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-yellow-300 hover:bg-yellow-300">
                        <TableHead className="font-bold text-black text-xs px-1 sm:px-2 py-1 text-center">Subject</TableHead>
                        <TableHead className="font-bold text-black text-xs text-center px-1 sm:px-2 py-1">Total</TableHead>
                        <TableHead className="font-bold text-black text-xs text-center px-1 sm:px-2 py-1">Obtained</TableHead>
                        <TableHead className="font-bold text-black text-xs text-center px-1 sm:px-2 py-1">Percentage</TableHead>
                        <TableHead className="font-bold text-black text-xs text-center px-1 sm:px-2 py-1">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.subjects.map((subjectResult) => (
                        <TableRow key={subjectResult.subject}>
                            <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">{subjectResult.subject}</TableCell>
                            <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">{subjectResult.totalMarks}</TableCell>
                            <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">{subjectResult.obtainedMarks}</TableCell>
                            <TableCell className={cn("text-center font-medium px-1 sm:px-2 py-1 text-xs", subjectResult.percentage >= 80 && "text-pink-600 font-bold text-base")}>{subjectResult.percentage.toFixed(0)}%</TableCell>
                            <TableCell className={cn("text-center font-bold px-1 sm:px-2 py-1 text-xs", subjectResult.status === 'Passed' ? 'text-green-600' : 'text-red-600')}>
                                {subjectResult.status}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/80">
                        <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">Total</TableCell>
                        <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">{result.totalMarks}</TableCell>
                        <TableCell className="text-center px-1 sm:px-2 py-1 text-xs">{result.totalObtainedMarks}</TableCell>
                        <TableCell className={cn("text-center font-medium px-1 sm:px-2 py-1 text-xs", result.totalPercentage >= 80 && "text-pink-600 font-bold text-base")}>{result.totalPercentage.toFixed(0)}%</TableCell>
                        <TableCell className={cn("text-center font-bold px-1 sm:px-2 py-1 text-xs", result.overallStatus === 'Passed' ? 'text-green-600' : 'text-red-600')}>
                            {result.overallStatus}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
);

export default function AdminResultsPage() {
    const [results] = useState<ExamResult[]>(mockExamResults);
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    
    // Drill-down states
    const [filterUserId, setFilterUserId] = useState<string | null>(null);
    const [filterLevel, setLevelFilter] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const toOrdinal = (n: number) => {
        if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
        switch (n % 10) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    };

    const processedResults: ExamResultWithAttempt[] = useMemo(() => {
        const userLevelAttempts: { [key: string]: number } = {};
        // Chronological sort to calculate attempt numbers correctly
        const chronoSortedResults = [...results].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        return chronoSortedResults.map(result => {
            const key = `${result.userId}-${result.level}`;
            userLevelAttempts[key] = (userLevelAttempts[key] || 0) + 1;
            return { ...result, attemptNumber: userLevelAttempts[key] };
        });
    }, [results]);

    // Results filtered for the current view (Date, User, or User-Level)
    const displayResults = useMemo(() => {
        let filtered = [...processedResults];
        
        if (filterUserId) {
            filtered = filtered.filter(r => r.userId === filterUserId);
            if (filterLevel) {
                filtered = filtered.filter(r => r.level === filterLevel);
            }
            // Sort by level then by attempt (for user history view)
            return filtered.sort((a, b) => {
                if (a.level !== b.level) return a.level.localeCompare(b.level);
                return b.attemptNumber - a.attemptNumber;
            });
        }

        // Default: Date view
        return filtered
            .filter(result => isSameDay(new Date(result.examDate), selectedDate))
            .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
    }, [processedResults, selectedDate, filterUserId, filterLevel]);

    const stats = useMemo(() => {
        // Only calculate stats for the date view
        if (filterUserId) return null;

        const total = displayResults.length;
        const prizeWinners = displayResults.filter(r => r.totalPercentage >= 80 && r.attemptNumber === 1).length;
        const passed = displayResults.filter(r => r.overallStatus === 'Passed').length;
        const failed = displayResults.filter(r => r.overallStatus === 'Failed').length;

        return { total, prizeWinners, passed, failed };
    }, [displayResults, filterUserId]);

    const filterUserName = useMemo(() => {
        if (!filterUserId) return null;
        return mockUsers.find(u => u.id === filterUserId)?.name || "Unknown User";
    }, [filterUserId]);

    const handleFirstDayOfYear = () => setSelectedDate(startOfYear(selectedDate));
    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => {
        if (isAfter(addDays(selectedDate, 1), startOfToday())) return;
        setSelectedDate(prev => addDays(prev, 1));
    };
    const handleCurrentDay = () => setSelectedDate(startOfToday());
    const handleYearChange = (year: string) => setSelectedDate(prev => setYear(prev, parseInt(year)));

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        const startYear = 2020;
        // Generate years from currentYear down to 2020 so current year is topmost
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => {
        const start = subDays(selectedDate, 2);
        const end = addDays(selectedDate, 2);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    const clearFilters = () => {
        setFilterUserId(null);
        setLevelFilter(null);
    };

    if (!isClient) {
        return (
             <div className="p-4 md:p-6 lg:p-8">
                <Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
            </div>
        )
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

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <ClipboardList className="w-8 h-8 text-primary" />
                        Exam Results
                    </CardTitle>
                    <CardDescription>
                        View and manage all user exam results. Navigate by date or click on a user/level to see history.
                    </CardDescription>
                </CardHeader>
            </Card>

            {!filterUserId ? (
                <>
                    {/* Year Bar */}
                    <div className="flex items-center border rounded-sm w-fit mb-4 bg-card shadow-sm overflow-hidden">
                        <div className="px-4 py-2 border-r bg-muted/30 text-sm font-bold font-headline">Year:</div>
                        <Select value={getYear(selectedDate).toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="h-10 border-0 rounded-none shadow-none focus:ring-0 px-4 min-w-[100px] font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Navigation Bar */}
                    <div className="flex items-center border rounded-sm w-full bg-card mb-6 shadow-sm overflow-hidden">
                        <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0" onClick={handleFirstDayOfYear} title="First day of year">
                            <ChevronsLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" className="rounded-none border-r h-12 w-12 px-0" onClick={handlePrevDay} title="Previous day">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex-1 flex items-center h-12 overflow-x-auto no-scrollbar">
                            {dateRange.map(date => (
                                <div 
                                    key={date.toISOString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex-1 h-full flex items-center justify-center border-r px-4 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors hover:bg-muted",
                                        isSameDay(date, selectedDate) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {format(date, 'MMM d')}
                                </div>
                            ))}
                        </div>

                        <Button 
                            variant="ghost" 
                            className="rounded-none border-l h-12 w-12 px-0" 
                            onClick={handleNextDay} 
                            disabled={isSameDay(selectedDate, startOfToday())}
                            title="Next day"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" className="rounded-none h-12 w-12 px-0" onClick={handleCurrentDay} title="Today">
                            <ChevronsRight className="h-5 w-5" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="bg-background">
                        <X className="mr-2 h-4 w-4" /> Clear Filter
                    </Button>
                    <div className="flex items-center gap-2 text-lg font-bold font-headline text-primary">
                        <History className="w-5 h-5" />
                        History: {filterUserName}
                        {filterLevel && <Badge className="ml-2 bg-blue-500">Level {filterLevel}</Badge>}
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="pt-6">
                    {!filterUserId ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-4">
                            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                                Results for: {format(selectedDate, 'do MMMM, yyyy')}
                                {isSameDay(selectedDate, startOfToday()) && <Badge variant="outline" className="ml-2">Today</Badge>}
                            </h2>
                            
                            {/* Summary Data Bar */}
                            {stats && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center overflow-hidden rounded-md border text-sm font-medium">
                                        <div className="bg-muted px-3 py-1 border-r text-xs uppercase tracking-wider">Total:</div>
                                        <div className="bg-card px-3 py-1">{stats.total}</div>
                                    </div>
                                    <div className="flex items-center overflow-hidden rounded-md border border-yellow-500 text-sm font-medium">
                                        <div className="bg-yellow-500 text-white px-3 py-1 border-r text-xs uppercase tracking-wider">Prize Winner:</div>
                                        <div className="bg-yellow-50 px-3 py-1 text-yellow-700">{stats.prizeWinners}</div>
                                    </div>
                                    <div className="flex items-center overflow-hidden rounded-md border border-green-500 text-sm font-medium">
                                        <div className="bg-green-500 text-white px-3 py-1 border-r text-xs uppercase tracking-wider">Passed:</div>
                                        <div className="bg-green-50 px-3 py-1 text-green-700">{stats.passed}</div>
                                    </div>
                                    <div className="flex items-center overflow-hidden rounded-md border border-red-500 text-sm font-medium">
                                        <div className="bg-red-500 text-white px-3 py-1 border-r text-xs uppercase tracking-wider">Failed:</div>
                                        <div className="bg-red-50 px-3 py-1 text-red-700">{stats.failed}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                    
                    {displayResults.length === 0 ? (
                        <p className="text-muted-foreground text-center py-20 italic">No exam results found for this view.</p>
                    ) : (
                        <Accordion type="multiple" className="w-full">
                            {displayResults.map(result => (
                                <AccordionItem value={result.id} key={result.id}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <Avatar className="h-10 w-10 hidden sm:flex">
                                                    <AvatarImage src={result.userAvatarUrl} alt={result.userName} />
                                                    <AvatarFallback>{result.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0">
                                                    <div 
                                                        className="font-semibold hover:text-primary transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilterUserId(result.userId);
                                                            setLevelFilter(null);
                                                        }}
                                                    >
                                                        {result.userName}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span 
                                                            className="hover:text-primary transition-colors cursor-pointer font-medium underline-offset-2 hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFilterUserId(result.userId);
                                                                setLevelFilter(result.level);
                                                            }}
                                                        >
                                                            Level: {result.level}
                                                        </span>
                                                        <span className="font-bold text-primary">&bull;</span>
                                                        <span>{toOrdinal(result.attemptNumber)} time</span>
                                                        {filterUserId && (
                                                            <>
                                                                <span className="font-bold text-primary">&bull;</span>
                                                                <span className="text-xs">{format(new Date(result.examDate), 'dd MMM yyyy')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">{result.totalObtainedMarks}/{result.totalMarks}</p>
                                                <div className="flex justify-end items-center gap-2">
                                                    <Badge className={cn(result.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                        {result.overallStatus}
                                                    </Badge>
                                                    <span className={cn("text-sm font-semibold", result.totalPercentage >= 80 ? "text-pink-600 font-bold" : "text-muted-foreground")}>
                                                        ({result.totalPercentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <DetailedResultTable result={result} />
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
