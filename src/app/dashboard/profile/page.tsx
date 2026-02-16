'use client';

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Camera, Save, X } from "lucide-react";
import { currentUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { thanasByDistrict } from "@/lib/location-data";

const districts = Object.keys(thanasByDistrict);
const hobbiesList = [
  "Reading", "Writing", "Poetry", "History", "Science Fiction", 
  "Fantasy", "Philosophy", "Art", "Travel", "Cooking", 
  "Gardening", "Gaming", "Music", "Movies", "Sports"
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<User>(currentUser);
  
  const initialDistrict = userProfile.location.split(', ')[1] === 'Bangladesh' ? userProfile.location.split(', ')[0] : "";
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [thanas, setThanas] = useState<string[]>(thanasByDistrict[initialDistrict] || []);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setThanas(thanasByDistrict[district] || []);
  };

  const handleProfileChange = (field: keyof User, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        handleProfileChange('avatarUrl', loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving profile:", userProfile);
    setIsEditing(false);
    // Here you would also update the original currentUser mock or call an API
    // For this demo, we can just log it.
  };

  const handleCancel = () => {
    setUserProfile(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            // EDITING VIEW
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                 <div className="relative w-24 h-24 flex-shrink-0">
                    <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarChange} />
                    <Avatar className="w-24 h-24 border-4 border-card">
                        <AvatarImage src={userProfile.avatarUrl} />
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button type="button" size="icon" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" onClick={() => avatarInputRef.current?.click()}>
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Upload Picture</span>
                    </Button>
                </div>
                <div className="grid gap-2 w-full">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={userProfile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input id="institution" value={userProfile.institution} onChange={(e) => handleProfileChange('institution', e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="district">District</Label>
                        <Select onValueChange={handleDistrictChange} defaultValue={selectedDistrict}>
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
                            {userProfile.hobbies.length > 0 ? `${userProfile.hobbies.length} hobbies selected` : "Select your hobbies"}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            <ScrollArea className="h-60">
                                {hobbiesList.map((hobby) => (
                                    <DropdownMenuCheckboxItem
                                        key={hobby}
                                        checked={userProfile.hobbies.includes(hobby)}
                                        onCheckedChange={(checked) => {
                                            const newHobbies = checked 
                                                ? [...userProfile.hobbies, hobby]
                                                : userProfile.hobbies.filter((h) => h !== hobby);
                                            handleProfileChange('hobbies', newHobbies);
                                        }}
                                    >
                                    {hobby}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {userProfile.hobbies.map(hobby => <Badge key={hobby} variant="secondary">{hobby}</Badge>)}
                    </div>
                </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}><X className="mr-2 h-4 w-4" />Cancel</Button>
                <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
              </div>
            </form>
          ) : (
            // VIEWING VIEW
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-card">
                <AvatarImage src={userProfile.avatarUrl} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-3xl font-bold font-headline">{userProfile.name}</h1>
                  <Badge className="text-sm">Level: {userProfile.level.toFixed(1)}</Badge>
                </div>
                <p className="text-muted-foreground mt-1">{userProfile.institution}</p>
                <div className="flex items-center text-muted-foreground text-sm mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{userProfile.location}</span>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Hobbies</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary">{hobby}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
