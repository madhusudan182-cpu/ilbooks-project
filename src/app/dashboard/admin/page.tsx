'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Book, ListChecks, BookOpen, Package, ClipboardList, Landmark, BarChart, Trophy, CalendarClock, MessageSquareQuote } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { currentUser } from "@/lib/auth";
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { cn } from "@/lib/utils";

const NotificationBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md ring-2 ring-background animate-in zoom-in duration-300">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default function AdminPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const [isClient, setIsClient] = useState(false);
    
    // Fetch live orders to count new ones
    const ordersQuery = useMemo(() => (firestore ? collection(firestore, 'orders') : null), [firestore]);
    const { data: orders } = useCollection<Order>(ordersQuery);

    const newOrdersCount = useMemo(() => {
        return orders?.filter(o => o.status === 'Paid').length || 0;
    }, [orders]);

    // Mock counts for Support categories (since support DB isn't implemented yet)
    const supportCounts = {
        competition: 3,
        bookShop: 5,
        user: 2,
        others: 1
    };

    useEffect(() => {
      setIsClient(true);
        if (!currentUser.isAdmin) {
            router.push('/dashboard');
        }
    }, [router]);
    
    if (!currentUser.isAdmin || !isClient) {
        return null; 
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                <MessageSquareQuote className="text-primary w-6 h-6"/> 
                User Support
              </CardTitle>
              <CardDescription>View and respond to user feedback and complaints.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
              <div className="relative">
                <Button asChild>
                    <Link href="/dashboard/admin/support/competition">Competition</Link>
                </Button>
                <NotificationBadge count={supportCounts.competition} />
              </div>

              <div className="relative">
                <Button asChild>
                    <Link href="/dashboard/admin/support/book-shop">Book Shop</Link>
                </Button>
                <NotificationBadge count={supportCounts.bookShop} />
              </div>

              <div className="relative">
                <Button asChild>
                    <Link href="/dashboard/admin/support/user">User</Link>
                </Button>
                <NotificationBadge count={supportCounts.user} />
              </div>

              <div className="relative">
                <Button asChild>
                    <Link href="/dashboard/admin/support/others">Others</Link>
                </Button>
                <NotificationBadge count={supportCounts.others} />
              </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-headline"><ClipboardList className="text-primary w-6 h-6"/> Exam Results</CardTitle>
              <CardDescription>View the results of all user exam attempts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/dashboard/admin/results">View User Results</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/admin/schedule">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Exam Schedule
                </Link>
              </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                  <Book className="w-6 h-6 text-primary"/> All Syllabi
              </CardTitle>
              <CardDescription>View all competition syllabi.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href="/dashboard/admin/syllabi">View Syllabus for All Levels</Link>
              </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-headline"><ListChecks className="text-primary w-6 h-6"/> All Questions</CardTitle>
                <CardDescription>All available questions are visible to admins for review, grouped by level.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/admin/questions">View Questions for All Levels</Link>
                </Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                  <BookOpen className="w-6 h-6 text-primary"/> Manage Books
              </CardTitle>
              <CardDescription>View and manage all competition books by level or category.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                  <Link href="/dashboard/admin/books">All Levels</Link>
              </Button>
              <Button asChild>
                  <Link href="/dashboard/admin/books?tab=vocab">Vocabulary & Grammar</Link>
              </Button>
              <Button asChild>
                  <Link href="/dashboard/admin/books?tab=popular">Popular</Link>
              </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-headline">
              <Landmark className="text-primary w-6 h-6" /> Accounts
            </CardTitle>
            <CardDescription>Manage financial transactions, user rewards, and orders.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/admin/accounts/transactions">Transactions</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/admin/accounts/prizes">Prizes & Gifts</Link>
            </Button>
            <div className="relative">
                <Button asChild>
                    <Link href="/dashboard/admin/orders">View All Orders</Link>
                </Button>
                <NotificationBadge count={newOrdersCount} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-headline"><BarChart className="text-primary w-6 h-6"/> Analytics</CardTitle>
              <CardDescription>View user engagement and app performance.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href="/dashboard/admin/analytics">View Analytics</Link>
              </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
