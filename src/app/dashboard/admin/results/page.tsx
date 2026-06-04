
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
import { format, subDays, addDays, startOfYear, isSameDay, isAfter, startOfToday, setYear, getYear, eachDayOfInterval, startOfMonth, endOfMonth, getMonth, setMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ExamResultWithAttempt = ExamResult & { attemptNumber: number };

const SummaryBox = ({ label, value, variant }: { label: string, value: number | string, variant: 'total' | 'prize' | 'passed' | 'failed' }) => {
    const config = {
        total: {
            border: 'border-slate-300',
            labelBg: 'bg-slate-100',
            labelText: 'text-slate-700',
            labelColor: 'border-slate-300'
        },
        prize: {
            border: 'border-orange-500',
            labelBg: 'bg-orange-500',
            labelText: 'text-white',
            labelColor: 'border-orange-500'
        },
        passed: {
            border: 'border-green-600',
            labelBg: 'bg-green-600',
            labelText: 'text-white',
            labelColor: 'border-green-600'
        },
        failed: {
            border: 'border-red-600',
            labelBg: 'bg-red-600',
            labelText: 'text-white',
            labelColor: 'border-red-600'
        }
    }[variant];

    return (
        <div className={cn("flex items-center border rounded-sm overflow-hidden h-8 shadow-sm", config.border)}>
            <div className={cn(config.labelBg, config.labelText, "px-3 h-full flex items-center text-[11px] font-bold tracking-tight border-r", config.labelColor)}>
                {label}:
            </div>
            <div className="bg-white px-3 h-full flex items-center text-sm font-bold min-w-[35px] justify-center text-black">
                {value}
            </div>
        </div>
    );
};

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

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminResultsPage() {
    const [results] = useState<ExamResult[]>(mockExamResults);
    const [isClient, setIsClient] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [showMonthlySummary, setShowMonthlySummary] = useState(false);
    
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
        const chronoSortedResults = [...results].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

        return chronoSortedResults.map(result => {
            const key = `${result.userId}-${result.level}`;
            userLevelAttempts[key] = (userLevelAttempts[key] || 0) + 1;
            return { ...result, attemptNumber: userLevelAttempts[key] };
        });
    }, [results]);

    const displayResults = useMemo(() => {
        let filtered = [...processedResults];
        
        if (filterUserId) {
            filtered = filtered.filter(r => r.userId === filterUserId);
            if (filterLevel) {
                filtered = filtered.filter(r => r.level === filterLevel);
            }
            return filtered.sort((a, b) => {
                if (a.level !== b.level) return a.level.localeCompare(b.level);
                return b.attemptNumber - a.attemptNumber;
            });
        }

        return filtered
            .filter(result => isSameDay(new Date(result.examDate), selectedDate))
            .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
    }, [processedResults, selectedDate, filterUserId, filterLevel]);

    const dailyStats = useMemo(() => {
        if (filterUserId) return null;
        const resultsOnDay = processedResults.filter(r => isSameDay(new Date(r.examDate), selectedDate));
        const total = resultsOnDay.length;
        const prizeWinners = resultsOnDay.filter(r => r.totalPercentage >= 80 && r.attemptNumber === 1).length;
        const passed = resultsOnDay.filter(r => r.overallStatus === 'Passed').length;
        const failed = resultsOnDay.filter(r => r.overallStatus === 'Failed').length;
        return { total, prizeWinners, passed, failed };
    }, [processedResults, selectedDate, filterUserId]);

    const monthlyStats = useMemo(() => {
        const year = getYear(selectedDate);
        const month = getMonth(selectedDate);
        const resultsInMonth = processedResults.filter(r => {
            const d = new Date(r.examDate);
            return getYear(d) === year && getMonth(d) === month;
        });
        const total = resultsInMonth.length;
        const prizeWinners = resultsInMonth.filter(r => r.totalPercentage >= 80 && r.attemptNumber === 1).length;
        const passed = resultsInMonth.filter(r => r.overallStatus === 'Passed').length;
        const failed = resultsInMonth.filter(r => r.overallStatus === 'Failed').length;
        return { total, prizeWinners, passed, failed };
    }, [processedResults, selectedDate]);

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
    const handleMonthClick = (monthIndex: number) => {
        setSelectedDate(prev => setMonth(prev, monthIndex));
        setShowMonthlySummary(true);
    };

    const years = useMemo(() => {
        const currentYear = getYear(new Date());
        return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const dateRange = useMemo(() => {
        // Keep selectedDate in the center of a 5-day window
        const start = subDays(selectedDate, 2);
        const end = addDays(selectedDate, 2);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    const clearFilters = () => {
        setFilterUserId(null);
        setLevelFilter(null);
    };

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

                    {/* Monthly Summary Bar (Conditional) */}
                    {showMonthlySummary && (
                        <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-muted/20 border rounded-md animate-fade-in-up">
                             <div className="text-sm font-bold text-primary mr-auto flex items-center gap-2">
                                Monthly Summary: {format(selectedDate, 'MMMM yyyy')}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowMonthlySummary(false)}>
                                    <X className="h-3 w-3" />
                                </Button>
                             </div>
                             <SummaryBox label="Total" value={monthlyStats.total} variant="total" />
                             <SummaryBox label="Prize Winner" value={monthlyStats.prizeWinners} variant="prize" />
                             <SummaryBox label="Passed" value={monthlyStats.passed} variant="passed" />
                             <SummaryBox label="Failed" value={monthlyStats.failed} variant="failed" />
                        </div>
                    )}

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
                </>
            ) : (
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="bg-background shadow-sm">
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold font-headline text-primary flex items-center gap-2">
                                Results for: {format(selectedDate, 'do MMMM, yyyy')}
                                {isSameDay(selectedDate, startOfToday()) && <Badge variant="outline" className="ml-2">Today</Badge>}
                            </h2>
                            
                            {dailyStats && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <SummaryBox label="Total" value={dailyStats.total} variant="total" />
                                    <SummaryBox label="Prize Winner" value={dailyStats.prizeWinners} variant="prize" />
                                    <SummaryBox label="Passed" value={dailyStats.passed} variant="passed" />
                                    <SummaryBox label="Failed" value={dailyStats.failed} variant="failed" />
                                </div>
                            )}
                        </div>
                    ) : null}
                    
                    {displayResults.length === 0 ? (
                        <p className="text-muted-foreground text-center py-20 italic">No exam results found for this selection.</p>
                    ) : (
                        <Accordion type="multiple" className="w-full">
                            {displayResults.map(result => (
                                <AccordionItem value={result.id} key={result.id}>
                                    <AccordionTrigger className="hover:no-underline px-2">
                                        <div className="flex justify-between items-center w-full pr-2 sm:pr-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <Avatar className="h-10 w-10 hidden sm:flex border">
                                                    <AvatarImage src={result.userAvatarUrl} alt={result.userName} />
                                                    <AvatarFallback>{result.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0">
                                                    <div 
                                                        className="font-bold hover:text-primary transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilterUserId(result.userId);
                                                            setLevelFilter(null);
                                                        }}
                                                    >
                                                        {result.userName}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span 
                                                            className="hover:text-primary transition-colors cursor-pointer font-bold underline underline-offset-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFilterUserId(result.userId);
                                                                setLevelFilter(result.level);
                                                            }}
                                                        >
                                                            Level: {result.level}
                                                        </span>
                                                        <span className="font-bold text-primary">&bull;</span>
                                                        <span className="font-medium">{toOrdinal(result.attemptNumber)} time</span>
                                                        {filterUserId && (
                                                            <>
                                                                <span className="font-bold text-primary">&bull;</span>
                                                                <span>{format(new Date(result.examDate), 'dd MMM yyyy')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg leading-tight">{result.totalObtainedMarks}/{result.totalMarks}</p>
                                                <div className="flex justify-end items-center gap-2">
                                                    <Badge className={cn("text-[10px] h-5 px-1.5", result.overallStatus === 'Passed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200')} variant="outline">
                                                        {result.overallStatus}
                                                    </Badge>
                                                    <span className={cn("text-sm font-black", result.totalPercentage >= 80 ? "text-pink-600" : "text-muted-foreground")}>
                                                        {result.totalPercentage.toFixed(0)}%
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
