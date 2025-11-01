'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Testimonial } from '@/lib/types';

// Define the type for an Inquiry
interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  submittedAt: number; // Timestamp
}


export default function AdminFeedbackPage() {
  const { database } = useFirebase();
  const { toast } = useToast();
  
  const [testimonials, setTestimonials] = useState<(Testimonial & {id: string})[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);

  const testimonialsRef = useMemoFirebase(() => database ? ref(database, 'testimonials') : null, [database]);
  const inquiriesRef = useMemoFirebase(() => database ? ref(database, 'inquiries') : null, [database]);

  // Fetch Testimonials
  useEffect(() => {
    if (!testimonialsRef) return;
    const unsubscribe = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const list: (Testimonial & {id: string})[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTestimonials(list.reverse());
      setIsLoadingTestimonials(false);
    });
    return () => unsubscribe();
  }, [testimonialsRef]);
  
  // Fetch Inquiries
  useEffect(() => {
    if (!inquiriesRef) return;
    const unsubscribe = onValue(inquiriesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Inquiry[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setInquiries(list.reverse());
      setIsLoadingInquiries(false);
    });
    return () => unsubscribe();
  }, [inquiriesRef]);

  const handleDelete = async (path: string, type: 'Testimonial' | 'Inquiry') => {
      if (!database || !confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return;

      const docRef = ref(database, path);
      try {
          await remove(docRef);
          toast({
              title: `${type} Deleted`,
              description: `The ${type.toLowerCase()} has been successfully removed.`,
          });
      } catch (error) {
          console.error(`Error deleting ${type.toLowerCase()}:`, error);
          toast({
              variant: 'destructive',
              title: 'Delete Failed',
              description: `Could not delete the ${type.toLowerCase()}. Please try again.`,
          });
      }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>

      <Tabs defaultValue="testimonials">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testimonials">Customer Reviews</TabsTrigger>
          <TabsTrigger value="inquiries">Contact Inquiries</TabsTrigger>
        </TabsList>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTestimonials ? <p>Loading reviews...</p> : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.length > 0 ? testimonials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.createdAt), 'PP')}</TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>#{item.orderId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                                {item.rating} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{item.quote}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(`testimonials/${item.id}`, 'Testimonial')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">No reviews found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inquiries Tab */}
        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Contact Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInquiries ? <p>Loading inquiries...</p> : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.length > 0 ? inquiries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.submittedAt), 'PPp')}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.phone}</TableCell>
                          <TableCell className="max-w-sm whitespace-pre-wrap">{item.message}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="destructive" size="icon" onClick={() => handleDelete(`inquiries/${item.id}`, 'Inquiry')}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No inquiries found.</TableCell>
                         </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
