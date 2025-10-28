'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { getDatabase, ref, onValue, query, orderByChild } from 'firebase/database';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

// Define the type for an order item
interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  itemPrice: number;
  imageUrl: string;
}

// Define the type for an entire order
interface Order {
  id: string; // The order ID (e.g., 1001)
  orderDate: number; // Timestamp
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  buyerName: string;
  phoneNumber: string;
  deliveryMethod: 'delivery' | 'pickup';
  items: OrderItem[];
}


export default function AdminOrdersPage() {
  const { database } = useFirebase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const ordersQuery = useMemoFirebase(() => {
    if (!database) return null;
    const ordersRef = ref(database, 'orders');
    return query(ordersRef, orderByChild('orderDate'));
  }, [database]);

  useEffect(() => {
    if (!ordersQuery) {
        setIsLoading(false);
        return;
    }
    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersList: Order[] = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        setOrders(ordersList.reverse()); // Show newest first
      } else {
        setOrders([]);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [ordersQuery]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'processing':
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {isLoading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), 'PPp')}</TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>{order.phoneNumber}</TableCell>
                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell className="capitalize">{order.deliveryMethod}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
       {selectedOrder && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details: #{selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Placed on {format(new Date(selectedOrder.orderDate), 'PPPP p')}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6">
                {/* Customer and Shipping Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Customer Information</h3>
                        <p><span className="text-muted-foreground">Name:</span> {selectedOrder.buyerName}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phoneNumber}</p>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold">Shipping & Delivery</h3>
                        <p><span className="text-muted-foreground">Method:</span> <span className="capitalize">{selectedOrder.deliveryMethod}</span></p>
                        <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shippingAddress}</p>
                    </div>
                </div>

                <Separator />
                
                {/* Items List */}
                <div>
                     <h3 className="font-semibold mb-4">Items Ordered</h3>
                     <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                           <div key={index} className="flex items-center gap-4">
                                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right font-medium">
                                    {formatPrice(item.itemPrice * item.quantity)}
                                </div>
                           </div>
                        ))}
                     </div>
                </div>
                
                <Separator />

                {/* Order Total */}
                <div className="flex justify-end">
                    <div className="text-right">
                        <div className="flex justify-between gap-4">
                           <span className="text-muted-foreground">Subtotal</span>
                           <span>{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                         <div className="flex justify-between gap-4 font-bold text-lg mt-2">
                           <span>Total</span>
                           <span>{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
