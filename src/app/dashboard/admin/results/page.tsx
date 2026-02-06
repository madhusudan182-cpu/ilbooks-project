'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, ArrowLeft, Edit } from 'lucide-react';
import type { ExamResult, SubjectResult } from '@/lib/types';
import { mockExamResults } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminResultsPage() {
    const [results, setResults] = useState<ExamResult[]>(mockExamResults);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const sortedResults = [...results].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

    const handleEditClick = (result: ExamResult) => {
        // Deep copy to avoid mutating the original state object directly in the dialog
        setSelectedResult(JSON.parse(JSON.stringify(result)));
        setIsEditDialogOpen(true);
    };

    const handleSaveChanges = () => {
        if (!selectedResult) return;

        // Recalculate totals and percentages
        const totalObtainedMarks = selectedResult.subjects.reduce((sum, r) => sum + Number(r.obtainedMarks), 0);
        const totalMarks = selectedResult.subjects.reduce((sum, r) => sum + r.totalMarks, 0);
        const totalPercentage = totalMarks > 0 ? (totalObtainedMarks / totalMarks) * 100 : 0;
        
        const updatedSubjects = selectedResult.subjects.map(s => {
            const obtained = Number(s.obtainedMarks);
            const total = s.totalMarks;
            const percentage = total > 0 ? (obtained / total) * 100 : 0;
            return {
                ...s,
                obtainedMarks: obtained,
                percentage,
                status: percentage >= 60 ? 'Passed' : 'Failed'
            } as SubjectResult;
        });

        const overallStatus = updatedSubjects.every(r => r.status === 'Passed') ? 'Passed' : 'Failed';
        
        const updatedResult: ExamResult = {
            ...selectedResult,
            subjects: updatedSubjects,
            totalObtainedMarks,
            totalMarks,
            totalPercentage,
            overallStatus
        };

        setResults(prevResults =>
            prevResults.map(r => r.id === updatedResult.id ? updatedResult : r)
        );
        setIsEditDialogOpen(false);
        setSelectedResult(null);
    };
    
    const handleSubjectMarkChange = (subjectName: string, newMarks: string) => {
        if (!selectedResult) return;
        
        const marks = parseInt(newMarks, 10);
        const subjectToUpdate = selectedResult.subjects.find(s => s.subject === subjectName);

        if (subjectToUpdate && (marks > subjectToUpdate.totalMarks || marks < 0)) {
            // Optionally, prevent invalid marks
            return;
        }

        setSelectedResult(prev => {
            if (!prev) return null;
            return {
                ...prev,
                subjects: prev.subjects.map(s => 
                    s.subject === subjectName 
                        ? { ...s, obtainedMarks: isNaN(marks) ? 0 : marks } 
                        : s
                )
            };
        });
    };

    return (
        <>
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
                            <ClipboardList className="w-8 h-8 text-primary" />
                            Exam Results
                        </CardTitle>
                        <CardDescription>
                            View and manage all user exam results for analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!sortedResults || sortedResults.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No exam results found.</p>
                        ) : (
                            <Accordion type="multiple" className="w-full">
                                {sortedResults.map(result => (
                                    <AccordionItem value={result.id} key={result.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <div className="flex items-center gap-4 text-left">
                                                    <Avatar className="h-10 w-10 hidden sm:flex">
                                                        <AvatarImage src={result.userAvatarUrl} alt={result.userName} />
                                                        <AvatarFallback>{result.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid gap-0">
                                                        <p className="font-semibold">{result.userName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Level: {result.level}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">{result.totalObtainedMarks}/{result.totalMarks}</p>
                                                        <Badge className={cn(result.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                            {result.overallStatus}
                                                        </Badge>
                                                    </div>
                                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEditClick(result); }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold">Result Details</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        User: <Link href={`/dashboard/user/${result.userId}`} className="text-primary underline">{result.userName}</Link> <br />
                                                        Exam Date: {format(new Date(result.examDate), 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Subject Breakdown</h4>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Subject</TableHead>
                                                                <TableHead className="text-center">Marks</TableHead>
                                                                <TableHead className="text-center">Obtained</TableHead>
                                                                <TableHead className="text-center">Percentage</TableHead>
                                                                <TableHead className="text-right">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {result.subjects.map(subjectResult => (
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
                                                            <TableRow className="font-bold bg-muted/50">
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
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {selectedResult && (
                 <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Exam Result</DialogTitle>
                            <DialogDescription>
                                Editing marks for {selectedResult.userName} (Level: {selectedResult.level}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {selectedResult.subjects.map(subject => (
                                <div key={subject.subject} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`marks-${subject.subject}`} className="text-right col-span-2">
                                        {subject.subject} (out of {subject.totalMarks})
                                    </Label>
                                    <Input
                                        id={`marks-${subject.subject}`}
                                        type="number"
                                        value={subject.obtainedMarks}
                                        onChange={(e) => handleSubjectMarkChange(subject.subject, e.target.value)}
                                        className="col-span-2"
                                        max={subject.totalMarks}
                                        min={0}
                                    />
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
