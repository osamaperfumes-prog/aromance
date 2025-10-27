'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';

// The product type passed in might include a key if it's being edited
type EditableProduct = (Product & { key?: string, description?: string }) | null;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product & { description: string }, 'id' | 'imageId'>) => void;
  product: EditableProduct;
}

export const ProductDialog = ({ open, onOpenChange, onSave, product }: ProductDialogProps) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand);
      // For simplicity, we'll use brand as short description and description as long
      setShortDescription(product.brand);
      setDescription(product.description || '');
      setPrice(String(product.price));
    } else {
      // Reset form when adding new
      setName('');
      setBrand('');
      setShortDescription('');
      setDescription('');
      setPrice('');
    }
  }, [product, open]);

  const handleSubmit = () => {
    // Basic validation
    if (!name || !brand || !price) {
      alert('Please fill out all required fields.');
      return;
    }
    
    // In a real app, you would have more robust logic for ID and imageId generation
    onSave({
      name,
      brand,
      description: description, // long description
      price: parseFloat(price),
      discount: 0, // default discount to 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update the details of the product.' : 'Enter the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand (Short Desc.)
            </Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description (Long)
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={4} />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
