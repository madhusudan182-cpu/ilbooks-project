'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const deployments = [
    {
        id: 'deploy-final',
        date: new Date().toISOString(),
        status: 'Success',
        commit: 'Latest successful deployment. The live URL is now available.',
        url: 'https://ilbooks-app-prev.web.app'
    }
];

export default function AdminDeploymentsPage() {

    const getStatusInfo = (status: string) => {
        return {
            badgeClass: 'bg-green-100 text-green-800',
            icon: <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
        };
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
                            {deployments.map(deployment => {
                                const statusInfo = getStatusInfo(deployment.status);
                                return (
                                <TableRow key={deployment.id}>
                                    <TableCell className="font-medium">{format(new Date(deployment.date), 'dd MMM yyyy, h:mm a')}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(statusInfo.badgeClass, 'flex items-center w-fit')}>
                                            {statusInfo.icon}
                                            {deployment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{deployment.commit}</TableCell>
                                    <TableCell className="text-right">
                                        {deployment.url && (
                                            <Button asChild variant="link" size="sm">
                                                <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                                                    {deployment.url.replace('https://', '')}
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
