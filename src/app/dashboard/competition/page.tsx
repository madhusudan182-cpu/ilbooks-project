import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Book, Award, Percent, DollarSign, List, Edit } from "lucide-react";

export default function CompetitionPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Competition</h1>
                <p className="text-muted-foreground mt-2">Test your knowledge, level up, and win prizes!</p>
                <Badge className="mt-4 text-base">Your Current Level: 2.1</Badge>
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
                        <p className="text-muted-foreground">To participate in the exam, a fee of <span className="font-bold text-foreground">BDT 20.00</span> is required for each attempt.</p>
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

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><Book className="text-accent"/> Level Syllabus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <h4 className="font-semibold">Bengali (30 Marks)</h4>
                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                <li>"Abc" by Xyz</li>
                                <li>"Def" by Uvw</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">English (30 Marks)</h4>
                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                <li>"Ghi" by Rst</li>
                                <li>"Jkl" by Mno</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="text-center mt-8">
                 <Button size="lg" className="font-headline">
                    Proceed to Payment & Start Exam <ArrowRight className="ml-2 w-5 h-5"/>
                 </Button>
                 <p className="text-xs text-muted-foreground mt-2">Exam duration: 10 seconds per question.</p>
            </div>

        </div>
    );
}
