import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Book } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { allSyllabi } from '@/lib/syllabus';

export default function AdminPage() {
    const allLevels: string[] = [];
    for (let i = 0; i <= 19; i++) {
        if (i === 1) continue; // Skip level 1.x
        for (let j = 0; j <= 9; j++) {
            allLevels.push(`${i}.${j}`);
        }
    }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-headline">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Welcome to the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Here you can manage users, questions, and other site settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                <Book className="w-6 h-6 text-primary"/> All Syllabi
            </CardTitle>
            <CardDescription>View and manage all competition syllabi.</CardDescription>
        </CardHeader>
        <CardContent>
             <Accordion type="single" collapsible className="w-full max-h-[32rem] overflow-y-auto">
                {allLevels.map((level) => {
                    const syllabus = allSyllabi.find(s => s.level === level);
                    return (
                        <AccordionItem value={`level-${level}`} key={level}>
                            <AccordionTrigger className="font-semibold">Syllabus for Level {level}</AccordionTrigger>
                            <AccordionContent>
                                {syllabus ? (
                                    Object.entries(syllabus.subjects).map(([subjectName, details]) => (
                                        <div key={subjectName} className="mb-4 last:mb-0">
                                            <h4 className="font-semibold">{subjectName} ({details.marks} Marks)</h4>
                                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                                {details.topics.map((topic, i) => <li key={i}>{topic}</li>)}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">Syllabus not yet defined for this level.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </CardContent>
    </Card>
    </div>
  );
}
