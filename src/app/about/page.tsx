'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AboutUsPage() {
    const { database } = useFirebase();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const aboutUsRef = useMemoFirebase(() => database ? ref(database, 'settings/aboutUs') : null, [database]);

    useEffect(() => {
        if (!aboutUsRef) {
            setIsLoading(false);
            return;
        };

        const unsubscribe = onValue(aboutUsRef, (snapshot) => {
            const data = snapshot.val();
            setContent(data || 'Welcome to our store! Content is being updated.');
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching about us content:", error);
            setContent('Failed to load content. Please try again later.');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [aboutUsRef]);

    return (
        <div className="container mx-auto py-12 md:py-20">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center">About Us</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <div className="prose max-w-none text-foreground/80 whitespace-pre-wrap">
                            {content}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}