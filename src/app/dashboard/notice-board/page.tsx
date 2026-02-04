import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NoticeBoardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-headline">
            <Bell className="w-8 h-8 text-primary" />
            Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No new notices at the moment. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
