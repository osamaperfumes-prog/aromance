'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { firestore, auth, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [buyerName, setBuyerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price * (1 - item.discount / 100);
    return sum + price * item.quantity;
  }, 0);
  
  const validateForm = () => {
    if (deliveryMethod === 'delivery') {
        if (!buyerName || !phoneNumber || !city || !neighborhood || !street || !buildingNumber) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required buyer and address fields.' });
            return false;
        }
    } else {
        if (!buyerName || !phoneNumber) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out the buyer name and phone number.' });
            return false;
        }
    }
    return true;
  }

  const handleCheckout = async () => {
    if (!validateForm()) {
        return;
    }
    
    setIsSubmitting(true);
    
    if (!user) {
        initiateAnonymousSignIn(auth);
        toast({ title: 'Creating secure session...', description: 'Please click "Place your order" again to confirm.' });
        setIsSubmitting(false);
        return;
    }

    let shippingAddress = 'Pickup';
    if (deliveryMethod === 'delivery') {
        shippingAddress = `${street}, ${buildingNumber}, ${neighborhood}, ${city}. Landmark: ${landmark || 'N/A'}`;
    }

    const orderData = {
        userId: user.uid,
        orderDate: serverTimestamp(),
        totalAmount: subtotal,
        status: 'processing',
        shippingAddress: shippingAddress,
        buyerName: buyerName,
        phoneNumber: phoneNumber,
        deliveryMethod: deliveryMethod,
    };

    try {
        const orderCollectionRef = collection(firestore, 'users', user.uid, 'orders');
        const newOrderRef = await addDoc(orderCollectionRef, orderData);

        const batch = writeBatch(firestore);
        cartItems.forEach(item => {
            const orderItemRef = doc(collection(newOrderRef, 'orderItems'));
            const finalPrice = item.price * (1 - item.discount / 100);
            batch.set(orderItemRef, {
                orderId: newOrderRef.id,
                productId: item.id,
                quantity: item.quantity,
                itemPrice: finalPrice,
                name: item.name,
                brand: item.brand,
            });
        });

        await batch.commit();

        toast({ title: 'Order Placed!', description: 'You will be contacted soon.' });
        
        clearCart();
        setBuyerName('');
        setPhoneNumber('');
        setCity('');
        setNeighborhood('');
        setStreet('');
        setBuildingNumber('');
        setLandmark('');

    } catch (error: any) {
        console.error("Error placing order:", error);
        toast({ variant: 'destructive', title: 'Order Failed', description: 'There was a problem placing your order. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Your Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="border-b mb-4 hidden md:flex font-semibold text-sm text-muted-foreground uppercase">
                <div className="w-1/2 p-2">Product</div>
                <div className="w-1/6 p-2 text-center">Price</div>
                <div className="w-1/6 p-2 text-center">Quantity</div>
                <div className="w-1/6 p-2 text-right">Total</div>
            </div>

            {cartItems.map((item) => {
                const image = PlaceHolderImages.find(img => img.id === item.imageId);
                const finalPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={item.id} className="flex flex-col md:flex-row items-center border-b py-4">
                  <div className="w-full md:w-1/2 flex items-start md:items-center gap-4 p-2">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        data-ai-hint={image.imageHint}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <Button variant="ghost" size="icon" className="md:hidden -ml-2 mt-1 h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full md:w-1/6 p-2 flex justify-between items-center text-center">
                    <span className="md:hidden font-semibold">Price</span>
                    <span className="font-medium">{formatPrice(finalPrice)}</span>
                  </div>
                  <div className="w-full md:w-1/6 p-2 flex justify-between items-center text-center">
                     <span className="md:hidden font-semibold">Quantity</span>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-20 text-center"
                    />
                  </div>
                  <div className="w-full md:w-1/6 p-2 flex justify-between items-center text-right">
                    <span className="md:hidden font-semibold">Total</span>
                    <span className="font-semibold">{formatPrice(finalPrice * item.quantity)}</span>
                  </div>
                   <div className="hidden md:flex pl-4">
                     <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                        <X className="h-5 w-5" />
                     </Button>
                   </div>
                </div>
              );
            })}
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
             </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{deliveryMethod === 'delivery' ? 'Calculated at next step' : 'Pickup'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                </div>
                
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="buyer-name">Buyer Name</Label>
                    <Input id="buyer-name" placeholder="Enter your name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input id="phone-number" type="tel" placeholder="Enter your phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery or Pickup</Label>
                  <RadioGroup defaultValue="delivery" value={deliveryMethod} onValueChange={setDeliveryMethod} className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pickup</Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryMethod === 'delivery' && (
                   <div className="space-y-4 pt-4 border-t">
                     <h3 className="font-semibold text-lg">Location</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="e.g. Amman" value={city} onChange={(e) => setCity(e.target.value)} required />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="neighborhood">Neighborhood</Label>
                          <Input id="neighborhood" placeholder="e.g. Abdoun" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required />
                        </div>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="street">Street</Label>
                       <Input id="street" placeholder="e.g. 123 Main St" value={street} onChange={(e) => setStreet(e.target.value)} required />
                     </div>
                      <div className="space-y-2">
                       <Label htmlFor="building-number">Building Number</Label>
                       <Input id="building-number" placeholder="e.g. Building 1, Floor 2" value={buildingNumber} onChange={(e) => setBuildingNumber(e.target.value)} required />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="landmark">Nearest Landmark</Label>
                       <Input id="landmark" placeholder="e.g. Near the big mosque" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                     </div>
                   </div>
                )}
                
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isSubmitting || isUserLoading}>
                  {isUserLoading ? 'Loading...' : user ? 'Place your order' : 'Continue as Guest'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
