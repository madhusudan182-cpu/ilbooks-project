'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { mockExamResults } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { currentUser } from '@/lib/auth';
import type { ExamResult } from '@/lib/types';
import { cn } from '@/lib/utils';

const DetailedResultTable = ({ result }: { result: ExamResult }) => (
    <div className="border rounded-lg overflow-hidden my-4 animate-fade-in-up">
        <h3 className="p-4 font-bold text-center text-lg bg-muted">
            Result for Level {result.level} (Date: {format(new Date(result.examDate), 'dd/MM/yyyy')})
        </h3>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-yellow-300 hover:bg-yellow-300">
                        <TableHead className="font-bold text-black">Subject</TableHead>
                        <TableHead className="font-bold text-black text-center">Total Marks</TableHead>
                        <TableHead className="font-bold text-black text-center">Obtained</TableHead>
                        <TableHead className="font-bold text-black text-center">Percentage</TableHead>
                        <TableHead className="font-bold text-black text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.subjects.map((subjectResult) => (
                        <TableRow key={subjectResult.subject}>
                            <TableCell>{subjectResult.subject}</TableCell>
                            <TableCell className="text-center">{subjectResult.totalMarks}</TableCell>
                            <TableCell className="text-center">{subjectResult.obtainedMarks}</TableCell>
                            <TableCell className="text-center">{subjectResult.percentage.toFixed(0)}%</TableCell>
                            <TableCell className={cn("text-right font-bold", subjectResult.status === 'Passed' ? 'text-green-600' : 'text-red-600')}>
                                {subjectResult.status}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/80">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-center">{result.totalMarks}</TableCell>
                        <TableCell className="text-center">{result.totalObtainedMarks}</TableCell>
                        <TableCell className="text-center">{result.totalPercentage.toFixed(0)}%</TableCell>
                        <TableCell className={cn("text-right", result.overallStatus === 'Passed' ? 'text-green-600' : 'text-red-600')}>
                            {result.overallStatus}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
);


export default function ExamHistoryPage() {
    const [activeView, setActiveView] = useState<'last' | 'previous' | null>(null);
    const userExamHistory = mockExamResults.filter(result => result.userId === currentUser.id)
        .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
    
    const lastResult = userExamHistory.length > 0 ? userExamHistory[0] : null;

    const router = useRouter();

    return (
        <div className="p-2 md:p-4 lg:p-6">
            <div className="mb-2">
                <Button asChild variant="ghost">
                  <Link href="/dashboard/competition">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Competition
                  </Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        Your Exam Result
                    </CardTitle>
                    <CardDescription>
                        Here is a list of your past exam attempts.
                    </CardDescription>
                    <div className="pt-4 flex flex-wrap justify-center gap-2">
                        <Button onClick={() => setActiveView('last')} disabled={!lastResult}>
                            Last Exam Result
                        </Button>
                        <Button onClick={() => setActiveView('previous')} disabled={userExamHistory.length === 0}>
                            Previous Results
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:px-4">
                    {activeView === null && userExamHistory.length === 0 && (
                         <p className="text-muted-foreground text-center py-8">You have no exam history yet.</p>
                    )}
                    
                    {activeView === 'last' && lastResult && <DetailedResultTable result={lastResult} />}

                    {activeView === 'previous' && userExamHistory.length > 0 && (
                        <div className="overflow-x-auto mt-4 animate-fade-in-up">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-2">Date</TableHead>
                                        <TableHead className="px-4 py-2">Level</TableHead>
                                        <TableHead className="text-right px-4 py-2">Percentage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userExamHistory.map(result => (
                                        <TableRow key={result.id}>
                                            <TableCell className="px-4 py-2">{format(new Date(result.examDate), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="px-4 py-2">{result.level}</TableCell>
                                            <TableCell className="text-right font-medium px-4 py-2">
                                                {result.totalPercentage.toFixed(0)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                     {activeView === 'previous' && userExamHistory.length === 0 && (
                         <p className="text-muted-foreground text-center py-8">You have no exam history yet.</p>
                    )}
                </CardContent>
            </Card>
            <div className="mt-4 flex justify-center">
                <Button onClick={() => router.back()}>Back</Button>
            </div>
        </div>
    );
}
