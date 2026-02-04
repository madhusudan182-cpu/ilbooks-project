'use client';

import { useState } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { thanasByDistrict } from "@/lib/location-data";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const districts = Object.keys(thanasByDistrict);

const hobbiesList = [
  "Reading", "Writing", "Poetry", "History", "Science Fiction", 
  "Fantasy", "Philosophy", "Art", "Travel", "Cooking", 
  "Gardening", "Gaming", "Music", "Movies", "Sports"
];

export default function CreateProfilePage() {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [thanas, setThanas] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setThanas(thanasByDistrict[district] || []);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-muted">
              <AvatarImage src="" alt="Profile picture" />
              <AvatarFallback className="text-muted-foreground">
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Upload Picture</span>
            </Button>
          </div>
          <CardTitle className="text-3xl font-headline">Create Your Profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="profession">Profession</Label>
                <Select>
                  <SelectTrigger id="profession">
                    <SelectValue placeholder="Select your profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="job-holder">Job Holder</SelectItem>
                    <SelectItem value="jobless">Jobless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="institution">Current or Last Educational Institution</Label>
                <Input id="institution" placeholder="e.g., University of Dhaka" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Select onValueChange={handleDistrictChange}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(district => (
                      <SelectItem key={district} value={district} className="capitalize">{district.charAt(0).toUpperCase() + district.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="thana">Thana</Label>
                <Select disabled={!selectedDistrict}>
                    <SelectTrigger id="thana">
                        <SelectValue placeholder="Select your thana" />
                    </SelectTrigger>
                    <SelectContent>
                        {thanas.map(thana => (
                            <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Hobbies</Label>
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {selectedHobbies.length > 0 ? `${selectedHobbies.length} hobbies selected` : "Select your hobbies"}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <ScrollArea className="h-60">
                            {hobbiesList.map((hobby) => (
                                <DropdownMenuCheckboxItem
                                    key={hobby}
                                    checked={selectedHobbies.includes(hobby)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedHobbies((prev) => [...prev, hobby]);
                                        } else {
                                            setSelectedHobbies((prev) => prev.filter((h) => h !== hobby));
                                        }
                                    }}
                                >
                                {hobby}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-1 mt-1">
                    {selectedHobbies.map(hobby => <Badge key={hobby} variant="secondary">{hobby}</Badge>)}
                </div>
              <p className="text-sm text-muted-foreground">
                This will help us recommend books you'll love.
              </p>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild><Link href="/dashboard">Skip</Link></Button>
                <Button type="submit" className="font-headline" asChild>
                    <Link href="/dashboard">Save Profile</Link>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
