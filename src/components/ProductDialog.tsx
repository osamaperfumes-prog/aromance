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
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/data';

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
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setDiscount(String(product.discount || 0));
      setSelectedCategories(Array.isArray(product.category) ? product.category : []);
      setImageFile(null);
    } else {
      // Reset form when adding new
      setName('');
      setBrand('');
      setDescription('');
      setPrice('');
      setDiscount('0');
      setSelectedCategories([]);
      setImageFile(null);
    }
  }, [product, open]);

  const handleCategoryChange = (categoryTitle: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryTitle] : prev.filter(c => c !== categoryTitle)
    );
  };

  const handleSubmit = () => {
    // Basic validation
    if (!name || !brand || !price || selectedCategories.length === 0) {
      alert('Please fill out all required fields, including at least one category.');
      return;
    }
    
    // In a real app, you would handle image upload here.
    // For now, we'll just pass the data.
    onSave({
      name,
      brand,
      description: description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      category: selectedCategories,
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discount" className="text-right">
              Discount (%)
            </Label>
            <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Category
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              {categories.map((cat) => (
                <div key={cat.title} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${cat.title}`}
                    checked={selectedCategories.includes(cat.title)}
                    onCheckedChange={(checked) => handleCategoryChange(cat.title, !!checked)}
                  />
                  <Label htmlFor={`category-${cat.title}`} className="font-normal">{cat.title}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <Input id="image" type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="col-span-3" />
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
