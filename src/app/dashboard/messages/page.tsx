import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Lock } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex items-center justify-center p-4 md:p-6 lg:p-8 h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto bg-muted text-muted-foreground rounded-full p-3 w-fit mb-4">
                <Lock className="w-8 h-8"/>
            </div>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-headline">
            <MessageCircle />
            Chat Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You can use this tab once you have passed Level 0.3.
          </p>
          <p className="mt-4 font-semibold">
            Keep reading and competing to unlock chat!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
