'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Book, Award, Percent, DollarSign, Edit, ClipboardList } from "lucide-react";
import { PaymentGateway } from '@/components/payment-gateway';
import { allSyllabi } from '@/lib/syllabus';
import { currentUser } from '@/lib/auth';
import { allQuestions } from '@/lib/questions';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


export default function CompetitionPage() {
    const [showPayment, setShowPayment] = useState(false);
    const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const examFee = 20;

    const [userLevel, setUserLevel] = useState(currentUser.level.toFixed(1));
    const [isRegistered, setIsRegistered] = useState(false);
    const [isExamTime, setIsExamTime] = useState(false);

    useEffect(() => {
        const savedLevel = sessionStorage.getItem('currentUserLevel');
        if (savedLevel) {
            setUserLevel(savedLevel);
        }
    }, []);

    const competitionLevel = userLevel.startsWith('0.') ? '0.0' : userLevel;
    const userSyllabus = allSyllabi.find(s => s.level === competitionLevel);
    
    useEffect(() => {
        const registrationStatus = sessionStorage.getItem(`examRegistered_${competitionLevel}`);
        if (registrationStatus === 'true') {
            setIsRegistered(true);
        } else {
            setIsRegistered(false);
        }
    }, [competitionLevel]);

    useEffect(() => {
        const examSchedules: { [key: number]: { day: number, start: number, end: number } } = {
            1: { day: 5, start: 9, end: 10 },
            2: { day: 5, start: 10, end: 11 },
            3: { day: 5, start: 20, end: 21 },
            4: { day: 5, start: 21, end: 22 },
            5: { day: 6, start: 9, end: 10 },
            6: { day: 6, start: 10, end: 11 },
            7: { day: 6, start: 20, end: 21 },
            8: { day: 6, start: 21, end: 22 },
            9: { day: 0, start: 20, end: 21 },
            10: { day: 0, start: 21, end: 22 },
            11: { day: 1, start: 20, end: 21 },
            12: { day: 1, start: 21, end: 22 },
            13: { day: 2, start: 20, end: 21 },
            14: { day: 2, start: 21, end: 22 },
            15: { day: 3, start: 20, end: 21 },
            16: { day: 3, start: 21, end: 22 },
            17: { day: 4, start: 20, end: 21 },
            18: { day: 4, start: 21, end: 22 },
            19: { day: 4, start: 22, end: 23 },
        };

        const checkTime = () => {
            const [majorLevel] = competitionLevel.split('.').map(Number);
            
            if (!isRegistered || majorLevel < 1) {
                setIsExamTime(false);
                return;
            }
            
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            
            const schedule = examSchedules[majorLevel];

            if (schedule && day === schedule.day && hour >= schedule.start && hour < schedule.end) {
                setIsExamTime(true);
            } else {
                setIsExamTime(false);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); 

        return () => clearInterval(interval);
    }, [isRegistered, competitionLevel]);

    useEffect(() => {
        if (showComingSoonDialog) {
            const timer = setTimeout(() => {
                setShowComingSoonDialog(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showComingSoonDialog]);


    const handlePaymentSuccess = () => {
        const [majorLevel] = competitionLevel.split('.').map(Number);
        if (majorLevel < 1) {
             console.log("Payment successful, starting exam for level 0...");
             router.push(`/dashboard/competition/exam?level=${competitionLevel}`);
        } else {
            console.log("Payment successful, registration complete.");
            sessionStorage.setItem(`examRegistered_${competitionLevel}`, 'true');
            setIsRegistered(true);
            toast({
                title: "Registration Successful!",
                description: "Your 'Take the Exam' button will appear during the scheduled time.",
            });
        }
    };
    
    const handleStartExamClick = () => {
        const [majorLevel] = userLevel.split('.').map(Number);
        
        if (majorLevel >= 1) {
            // For levels 1.0 and up, always show payment on "Register" click
            setShowPayment(true);
        } else {
            // For level 0.x, check if questions exist before showing payment
            const hasQuestionsForLevel = allQuestions.some(q => q.level === competitionLevel);
            if (hasQuestionsForLevel) {
                setShowPayment(true);
            } else {
                setShowComingSoonDialog(true);
            }
        }
    }

    const [majorLevel] = userLevel.split('.').map(Number);
    const buttonText = majorLevel < 1 ? "Proceed to Payment & Start Exam" : "Register for the Exam";

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
                    <div className="flex flex-col justify-center items-center gap-2 mt-4">
                        <Badge className="text-base bg-red-100 text-red-800">Your Current Level: {userLevel}</Badge>
                         <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="bg-blue-800 text-blue-100 border-blue-900 hover:bg-blue-900 hover:text-blue-50">
                                <Link href="/dashboard/competition/history">
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    Exam Result
                                </Link>
                            </Button>
                            {isExamTime && (
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700 animate-pulse"
                                >
                                    <Link href={`/dashboard/competition/exam?level=${competitionLevel}`}>
                                        Take the Exam
                                    </Link>
                                </Button>
                            )}
                        </div>
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
                            <CardTitle className="text-lg">Syllabus for Level: {competitionLevel}</CardTitle>
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
                                <p className="text-muted-foreground">Syllabus for your current level ({competitionLevel}) is not available yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="text-center mt-8">
                     {(!isRegistered || majorLevel < 1) && (
                        <Button size="lg" className="font-headline px-4 md:px-8" onClick={handleStartExamClick}>
                           {buttonText} <ArrowRight className="ml-2 w-5 h-5"/>
                        </Button>
                     )}
                     <p className="text-xs text-muted-foreground mt-2">
                        {isRegistered && majorLevel >= 1 
                            ? "You are registered. The 'Take the Exam' button will appear at your scheduled time."
                            : "Exam duration: 15 seconds per question."
                         }
                    </p>
                </div>

            </div>
        </>
    );
}
