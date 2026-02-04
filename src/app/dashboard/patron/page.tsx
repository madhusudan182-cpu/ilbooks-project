import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart } from "lucide-react";

export default function PatronPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8 flex justify-center items-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                        <HandHeart className="w-8 h-8"/>
                    </div>
                    <CardTitle className="text-3xl font-headline">Become a Patron</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        Your support keeps our community thriving. Thank you for helping us grow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-6">
                       <p>We are currently updating our payment systems. Please check back later for more ways to contribute!</p>
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}
