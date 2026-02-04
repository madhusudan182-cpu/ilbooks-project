import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                        In order to make our hand more strong you can donate any amount of money suitable for you. Your support keeps our community thriving.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="bKash" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="bKash">bKash</TabsTrigger>
                            <TabsTrigger value="rocket">Rocket</TabsTrigger>
                            <TabsTrigger value="dbbl">DBBL Nexus</TabsTrigger>
                        </TabsList>
                        <div className="pt-6">
                            <div className="space-y-4">
                                <p className="text-sm text-center text-muted-foreground">Step 1: Select a payment method above.</p>
                                <div className="space-y-2 text-center">
                                    <Label htmlFor="amount" className="font-semibold text-base">Step 2: Enter Amount (BDT)</Label>
                                    <Input id="amount" type="number" placeholder="e.g., 500" className="max-w-xs mx-auto text-center text-lg h-12"/>
                                </div>
                                <div className="text-center pt-4">
                                    <Button size="lg" className="w-full max-w-xs font-headline">
                                        Donate Now
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">You will be redirected to the payment gateway.</p>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
