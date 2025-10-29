'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { ref, push, serverTimestamp, get } from 'firebase/database';
import { Star } from 'lucide-react';

export default function ContactPage() {
  const { database } = useFirebase();
  const { toast } = useToast();

  // State for inquiry form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // State for testimonial form
  const [author, setAuthor] = useState('');
  const [orderId, setOrderId] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill out all fields for your inquiry.',
      });
      return;
    }

    setIsSubmittingInquiry(true);
    // Here you would typically send the data to a backend or an email service.
    // For this example, we'll just simulate a delay and show a success message.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmittingInquiry(false);
    toast({
      title: 'Message Sent!',
      description: 'Thank you for contacting us. We will get back to you shortly.',
    });

    setName('');
    setPhone('');
    setMessage('');
  };
  
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !quote || rating === 0 || !orderId) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide your name, order number, rating, and review.' });
      return;
    }
    if (!database) {
      toast({ variant: 'destructive', title: 'Database Error', description: 'Could not connect to the database.' });
      return;
    }

    setIsSubmittingTestimonial(true);

    try {
        const orderRef = ref(database, `orders/${orderId}`);
        const orderSnapshot = await get(orderRef);

        if (!orderSnapshot.exists()) {
            throw new Error('Order not found. Please check your order number.');
        }

        const orderData = orderSnapshot.val();

        // Condition 1: Check if order status is 'delivered'
        if (orderData.status !== 'delivered') {
            throw new Error('You can only review orders that have been delivered.');
        }

        // Condition 2: Check if author name matches buyer name (case-insensitive)
        if (orderData.buyerName.toLowerCase() !== author.toLowerCase()) {
            throw new Error('The name does not match the buyer name on the order.');
        }

        // All checks passed, proceed to save the testimonial
        const testimonialData = {
          author,
          orderId,
          quote,
          rating,
          createdAt: serverTimestamp(),
        };

        const testimonialsRef = ref(database, 'testimonials');
        await push(testimonialsRef, testimonialData);
        
        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.'});
        
        setAuthor('');
        setOrderId('');
        setQuote('');
        setRating(0);

    } catch (error: any) {
      console.error("Error submitting testimonial:", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message || 'Could not submit your review. Please try again.'});
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };


  return (
    <div className="container mx-auto py-12 md:py-20 flex flex-col items-center gap-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Contact Us</CardTitle>
          <CardDescription>
            Have a question or inquiry? Fill out the form below and we&apos;ll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInquirySubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingInquiry}>
              {isSubmittingInquiry ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Leave a Review</CardTitle>
          <CardDescription>
            Share your experience with us. Your feedback helps us and other customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestimonialSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="author">Your Name</Label>
              <Input
                id="author"
                placeholder="Enter your name as it appears on the order"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="orderId">Order Number</Label>
              <Input
                id="orderId"
                placeholder="e.g., 1001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-7 w-7 cursor-pointer transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
            <div className="space-y-2">
              <Label htmlFor="quote">Your Review</Label>
              <Textarea
                id="quote"
                placeholder="Tell us about your experience..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingTestimonial}>
              {isSubmittingTestimonial ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
