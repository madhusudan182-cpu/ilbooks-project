"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers } from "@/lib/data";
import { MapPin } from "lucide-react";

export default function ProfilePage() {
  const user = mockUsers[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-card">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
              <Badge className="text-sm">Level: {user.level.toFixed(1)}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{user.institution}</p>
            <div className="flex items-center text-muted-foreground text-sm mt-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{user.location}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.map((hobby) => (
                  <Badge key={hobby} variant="secondary">{hobby}</Badge>
                ))}
              </div>
            </div>
          </div>
          <Button>Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
