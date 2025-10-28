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
import Image from 'next/image';

type EditableProduct = (Product & { key?: string; }) | null;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product, 'id' | 'imageUrl'>, imageFile?: File) => Promise<void>;
  product: EditableProduct;
}

export const ProductDialog = ({ open, onOpenChange, onSave, product }: ProductDialogProps) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setDiscount(String(product.discount || 0));
      setSelectedCategories(Array.isArray(product.category) ? product.category : []);
      if (product.imageUrl) {
        setImagePreviewUrl(product.imageUrl);
      } else {
        setImagePreviewUrl('');
      }
      setImageFile(undefined); // Clear file input on edit
    } else {
      // Reset form when adding new
      setName('');
      setBrand('');
      setDescription('');
      setPrice('');
      setDiscount('0');
      setSelectedCategories([]);
      setImagePreviewUrl('');
      setImageFile(undefined);
    }
  }, [product, open]);

  const handleCategoryChange = (categoryTitle: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryTitle] : prev.filter(c => c !== categoryTitle)
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async () => {
    if (!name || !brand || !price || (!imageFile && !product?.imageUrl) || selectedCategories.length === 0) {
      alert('Please fill out all required fields, including an image and at least one category.');
      return;
    }
    
    await onSave({
      name,
      brand,
      description: description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      category: selectedCategories,
    }, imageFile);
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
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="imageFile" className="text-right pt-2">
              Image
            </Label>
             <div className="col-span-3">
                <Input id="imageFile" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreviewUrl && (
                    <div className="mt-4 relative w-full h-48">
                        <Image src={imagePreviewUrl} alt="Image preview" fill className="rounded-md object-contain" />
                    </div>
                )}
             </div>
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
