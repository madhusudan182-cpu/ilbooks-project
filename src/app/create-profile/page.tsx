import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

export default function CreateProfilePage() {
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
                <Label htmlFor="institution">Current / Last Institution</Label>
                <Input id="institution" placeholder="e.g., University of Dhaka" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" placeholder="e.g., Dhaka" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="thana">Thana</Label>
                <Input id="thana" placeholder="e.g., Dhanmondi" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hobbies">Hobbies</Label>
              <Textarea id="hobbies" placeholder="List your hobbies, separated by commas (e.g., Reading, Writing, Gardening)" />
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
