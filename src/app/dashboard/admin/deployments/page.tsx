'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const mockDeployments = [
    {
        id: 'deploy-1',
        date: new Date().toISOString(),
        status: 'In Progress',
        commit: 'a1b2c3d - Add SEO metadata for launch',
        url: null
    },
    {
        id: 'deploy-2',
        date: '2026-02-15T14:50:00.000Z',
        status: 'Success',
        commit: 'f4e5d6c - Fix security rules for admin panel',
        url: 'https://ilbooks-app-prev.web.app'
    },
    {
        id: 'deploy-3',
        date: '2026-02-15T14:45:00.000Z',
        status: 'Failed',
        commit: 'g7h8i9j - Attempt to fix Firebase connection',
        url: null
    }
];

export default function AdminDeploymentsPage() {

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Success':
                return 'bg-green-100 text-green-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

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
                        Deployments
                    </CardTitle>
                    <CardDescription>
                        View the status and history of your application deployments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Update</TableHead>
                                <TableHead className="text-right">Live URL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockDeployments.map(deployment => (
                                <TableRow key={deployment.id}>
                                    <TableCell className="font-medium">{format(new Date(deployment.date), 'dd MMM yyyy, h:mm a')}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(getStatusBadge(deployment.status))}>
                                            {deployment.status === 'In Progress' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {deployment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{deployment.commit}</TableCell>
                                    <TableCell className="text-right">
                                        {deployment.url ? (
                                            <Button asChild variant="link" size="sm">
                                                <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                                                    {deployment.url.replace('https://', '')}
                                                </a>
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">--</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
