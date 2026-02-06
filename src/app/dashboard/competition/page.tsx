'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Book, Award, Percent, DollarSign, Edit, History } from "lucide-react";
import { PaymentGateway } from '@/components/payment-gateway';
import { allSyllabi } from '@/lib/syllabus';
import { currentUser } from '@/lib/auth';
import { allQuestions } from '@/lib/questions';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockExamResults } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from '@/lib/utils';


export default function CompetitionPage() {
    const [showPayment, setShowPayment] = useState(false);
    const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
    const router = useRouter();
    const examFee = 20;

    // In a real app, you'd get the current user from an auth context.
    // To see the client view, you can now change the user in src/lib/auth.ts
    const userLevel = currentUser.level.toString();
    const userSyllabus = allSyllabi.find(s => s.level === userLevel);
    const userExamHistory = mockExamResults.filter(result => result.userId === currentUser.id);

    useEffect(() => {
        if (showComingSoonDialog) {
            const timer = setTimeout(() => {
                setShowComingSoonDialog(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showComingSoonDialog]);


    const handlePaymentSuccess = () => {
        console.log("Payment successful, starting exam...");
        router.push(`/dashboard/competition/exam?level=${userLevel}`);
    };
    
    const handleStartExamClick = () => {
        const hasQuestionsForLevel = allQuestions.some(q => q.level === userLevel);
        if (hasQuestionsForLevel) {
            setShowPayment(true);
        } else {
            setShowComingSoonDialog(true);
        }
    }

    return (
        <>
            <PaymentGateway
                amount={examFee}
                productName="Exam Fee"
                show={showPayment}
                onClose={() => setShowPayment(false)}
                onSuccess={handlePaymentSuccess}
            />

            <AlertDialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Coming Soon!</AlertDialogTitle>
                        <AlertDialogDescription>
                            We are still working on this Level. You will be notified when we are done!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            <div className="p-4 md:p-6 lg:p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-headline">Competition</h1>
                    <p className="text-muted-foreground mt-2">Test your knowledge, level up, and win prizes!</p>
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <Badge className="text-base">Your Current Level: {userLevel}</Badge>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-blue-800 text-blue-100 border-blue-900 hover:bg-blue-900 hover:text-blue-50">
                                    <History className="mr-2 h-4 w-4" />
                                    Exam History
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Your Exam History</DialogTitle>
                                    <DialogDescription>
                                        Here's a list of your past exam attempts.
                                    </DialogDescription>
                                </DialogHeader>
                                {userExamHistory.length > 0 ? (
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Level</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {userExamHistory.sort((a,b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()).map(result => (
                                                    <TableRow key={result.id}>
                                                        <TableCell>{format(new Date(result.examDate), 'dd/MM/yyyy')}</TableCell>
                                                        <TableCell>{result.level}</TableCell>
                                                        <TableCell className="font-medium">{result.totalObtainedMarks}/{result.totalMarks}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge className={cn(result.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                                {result.overallStatus}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">You have no exam history yet.</p>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Award className="text-accent"/> Rules & Prizes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p className="flex items-start gap-2"><Percent className="w-4 h-4 mt-1 flex-shrink-0"/> Score 60% or more in each section to pass the level.</p>
                            <p className="flex items-start gap-2"><Award className="w-4 h-4 mt-1 flex-shrink-0"/> Score 80% or more on your first try to be eligible for prizes.</p>
                            <p className="flex items-start gap-2"><Edit className="w-4 h-4 mt-1 flex-shrink-0"/> A deduction of 0.5 marks for each wrong answer.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><DollarSign className="text-accent"/> Exam Fee</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-muted-foreground">To participate in the exam, a fee of <span className="font-bold text-foreground">BDT {examFee.toFixed(2)}</span> is required for each attempt.</p>
                            <p className="font-semibold">Accepted Payment Methods:</p>
                            <div className="flex gap-4 items-center text-sm text-muted-foreground">
                                <span>Bkash</span>
                                <Separator orientation="vertical" className="h-4"/>
                                <span>Rocket</span>
                                 <Separator orientation="vertical" className="h-4"/>
                                <span>Nexus Pay</span>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Syllabus for Level: {userLevel}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userSyllabus ? (
                                Object.entries(userSyllabus.subjects).map(([subjectName, details]) => (
                                    <div key={subjectName} className="mb-4 last:mb-0">
                                        <h4 className="font-semibold">{subjectName} ({details.marks} Marks)</h4>
                                        <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                            {details.topics.map((topic, i) => <li key={i}>{topic}</li>)}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Syllabus for your current level ({userLevel}) is not available yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="text-center mt-8">
                     <Button size="lg" className="font-headline px-4 md:px-8" onClick={handleStartExamClick}>
                        Proceed to Payment & Start Exam <ArrowRight className="ml-2 w-5 h-5"/>
                     </Button>
                     <p className="text-xs text-muted-foreground mt-2">Exam duration: 15 seconds per question.</p>
                </div>

            </div>
        </>
    );
}
