'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarClock, Ban, PlayCircle, BellRing, Settings } from 'lucide-react';
import { examSchedules, examHolds } from '@/lib/exam-schedule';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSchedulePage() {
    const [holds, setHolds] = useState(examHolds);
    const { toast } = useToast();

    const handleToggleHold = (levelKey: string) => {
        const newHolds = { ...holds, [levelKey]: !holds[levelKey] };
        // This mutates the imported object, simulating a persistent state for this exercise
        examHolds[levelKey] = newHolds[levelKey];
        setHolds(newHolds);

        if (newHolds[levelKey]) {
            toast({ title: `Exam for Level ${levelKey}.x is now ON HOLD.` });
        } else {
            toast({ 
                title: `Exam for Level ${levelKey}.x is now ACTIVE.`,
                description: "A notification has been sent to registered users."
            });
        }
    };

    const handleSendNotice = (level: number) => {
        toast({
            title: "Notice Sent!",
            description: `A notification has been sent to all registered users for Level ${level}.x.`,
        });
    };

    const handleScheduleChange = (level: number) => {
        toast({
            title: "Schedule Updated",
            description: `The exam schedule for Level ${level}.x has been changed.`,
        });
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <CalendarClock className="w-8 h-8 text-primary" />
                        Exam Schedule Management
                    </CardTitle>
                    <CardDescription>
                        View, hold, and manage exam schedules for all levels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(examSchedules).map(([level, schedule]) => {
                                const isHeld = holds[level];
                                return (
                                    <TableRow key={level}>
                                        <TableCell className="font-semibold">Level {level}.x</TableCell>
                                        <TableCell>{schedule.dayName}, {schedule.start}:00 - {schedule.end}:00</TableCell>
                                        <TableCell>
                                            <Badge variant={isHeld ? 'destructive' : 'default'} className={cn(isHeld ? 'bg-red-500' : 'bg-green-500')}>
                                                {isHeld ? 'On Hold' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant={isHeld ? 'secondary' : 'destructive'} 
                                                    onClick={() => handleToggleHold(level)}
                                                >
                                                    {isHeld ? <PlayCircle className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                                    {isHeld ? 'Release' : 'Hold'}
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                         <Button size="sm" variant="outline">
                                                            <BellRing className="mr-2 h-4 w-4"/>
                                                            Notice
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Generate Notice for Level {level}.x</DialogTitle>
                                                            <DialogDescription>
                                                                This message will be sent as a notification to all registered users of this level.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Textarea placeholder="Write your notice here..." rows={5}/>
                                                        <DialogFooter>
                                                            <DialogTrigger asChild><Button variant="outline">Cancel</Button></DialogTrigger>
                                                            <DialogTrigger asChild><Button onClick={() => handleSendNotice(Number(level))}>Send Notice</Button></DialogTrigger>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                         <Button size="sm" variant="outline">
                                                            <Settings className="mr-2 h-4 w-4"/>
                                                            Change
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Change Schedule for Level {level}.x (Demo)</DialogTitle>
                                                            <DialogDescription>
                                                                This is a demonstration. In a real app, you'd have inputs to change the day and time.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <p className="py-4 text-center text-muted-foreground">(Schedule editing form would be here)</p>
                                                        <DialogFooter>
                                                            <DialogTrigger asChild><Button variant="outline">Cancel</Button></DialogTrigger>
                                                            <DialogTrigger asChild><Button onClick={() => handleScheduleChange(Number(level))}>Save Changes</Button></DialogTrigger>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
