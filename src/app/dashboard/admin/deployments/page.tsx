'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Server, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

const mockDeployments = [
  {
    id: 'dep_1a2b3c',
    date: '2024-07-29 10:30 AM',
    status: 'Success',
    message: 'Added social sharing meta tags.',
  },
  {
    id: 'dep_4d5e6f',
    date: '2024-07-29 09:15 AM',
    status: 'Failed',
    message: 'Deployment timed out.',
  },
  {
    id: 'dep_7g8h9i',
    date: '2024-07-28 05:00 PM',
    status: 'Success',
    message: 'Initial deployment.',
  },
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Success':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Failed':
            return <XCircle className="h-5 w-5 text-red-500" />;
        default:
            return <Clock className="h-5 w-5 text-yellow-500" />;
    }
}

export default function DeploymentsPage() {

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button asChild variant="ghost">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-headline">
            <Server className="w-8 h-8 text-primary" />
            Application Deployments
          </CardTitle>
          <CardDescription>
            Check the status and history of application deployments.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <div className="divide-y divide-border">
                    {mockDeployments.map((deployment) => (
                        <div key={deployment.id} className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                                {getStatusIcon(deployment.status)}
                                <div>
                                    <p className="font-semibold">{deployment.message}</p>
                                    <p className="text-sm text-muted-foreground">{deployment.date}</p>
                                </div>
                           </div>
                            <Button variant="outline" size="sm">
                                View Logs
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
