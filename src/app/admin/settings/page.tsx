'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { socialLinksConfig } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

type SocialLinks = Record<string, string>;

interface SiteMetadata {
    title: string;
    description: string;
}

export default function AdminSettingsPage() {
    const { database } = useFirebase();
    const { toast } = useToast();
    
    const [links, setLinks] = useState<SocialLinks>({});
    const [aboutUsContent, setAboutUsContent] = useState('');
    const [siteMetadata, setSiteMetadata] = useState<SiteMetadata>({ title: '', description: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const settingsRef = useMemoFirebase(() => database ? ref(database, 'settings') : null, [database]);

    useEffect(() => {
        if (!settingsRef) return;
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLinks(data.socialLinks || {});
                setAboutUsContent(data.aboutUs || '');
                setSiteMetadata(data.siteMetadata || { title: '', description: '' });
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

    const handleMetadataChange = (field: keyof SiteMetadata, value: string) => {
        setSiteMetadata(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSave = async () => {
        if (!settingsRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not available.' });
            return;
        }
        setIsSaving(true);
        try {
            await set(settingsRef, {
                socialLinks: links,
                aboutUs: aboutUsContent,
                siteMetadata: siteMetadata
            });
            toast({ title: 'Settings Saved', description: 'Your settings have been updated successfully.' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: error.message || 'Could not save settings.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Site Settings</h1>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Site Metadata</CardTitle>
                        <CardDescription>Update the site title and description for SEO.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <p>Loading...</p> : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="site-title">Site Title</Label>
                                    <Input 
                                        id="site-title"
                                        value={siteMetadata.title}
                                        onChange={(e) => handleMetadataChange('title', e.target.value)}
                                        placeholder="Your Site Title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site-description">Site Description</Label>
                                    <Textarea
                                        id="site-description"
                                        value={siteMetadata.description}
                                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                                        placeholder="A short description of your site."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Update the links for the social media icons in the footer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
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
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>About Us Page</CardTitle>
                        <CardDescription>Edit the content that appears on your "About Us" page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Loading...</p> : (
                            <div className="space-y-2">
                                <Label htmlFor="about-us-content">Page Content</Label>
                                <Textarea
                                    id="about-us-content"
                                    value={aboutUsContent}
                                    onChange={(e) => setAboutUsContent(e.target.value)}
                                    placeholder="Write a little bit about your store..."
                                    rows={15}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
