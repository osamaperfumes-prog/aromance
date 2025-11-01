'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { socialLinksConfig } from '@/lib/data';

type SocialLinks = Record<string, string>;

export default function AdminSettingsPage() {
    const { database } = useFirebase();
    const { toast } = useToast();
    
    const [links, setLinks] = useState<SocialLinks>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const settingsRef = useMemoFirebase(() => database ? ref(database, 'settings/socialLinks') : null, [database]);

    useEffect(() => {
        if (!settingsRef) return;
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLinks(data);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
            setIsLoading(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch settings.' });
        });
        return () => unsubscribe();
    }, [settingsRef, toast]);
    
    const handleInputChange = (name: string, value: string) => {
        setLinks(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = async () => {
        if (!settingsRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not available.' });
            return;
        }
        setIsSaving(true);
        try {
            await set(settingsRef, links);
            toast({ title: 'Settings Saved', description: 'Your social media links have been updated.' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: error.message || 'Could not save settings.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Update the links for the social media icons in the footer.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading settings...</p> : (
                        <div className="space-y-6">
                            {socialLinksConfig.map(social => (
                                <div key={social.name} className="space-y-2">
                                    <Label htmlFor={`link-${social.name.toLowerCase()}`}>{social.name}</Label>
                                    <Input 
                                        id={`link-${social.name.toLowerCase()}`}
                                        value={links[social.name.toLowerCase()] || ''}
                                        onChange={(e) => handleInputChange(social.name.toLowerCase(), e.target.value)}
                                        placeholder={social.placeholder}
                                    />
                                </div>
                            ))}
                             <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
