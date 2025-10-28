'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ProductDialog } from '@/components/ProductDialog';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Extend product type to include the key
type ProductWithKey = Product & { key: string };

export default function AdminProductsPage() {
  const { database } = useFirebase();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithKey | null>(null);

  useEffect(() => {
    if (!database) return;

    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsList: ProductWithKey[] = Object.entries(data).map(([key, value]) => ({
            key,
            id: key,
            ...((value as Omit<Product, 'id'>)),
          }));
          setProducts(productsList.reverse());
        } else {
          setProducts([]);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch products from the database.',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [database, toast]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: ProductWithKey) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (productKey: string) => {
      if (!database || !confirm('Are you sure you want to delete this product?')) return;
      
      try {
          const productRef = ref(database, `products/${productKey}`);
          await remove(productRef);
          toast({
              title: 'Product Deleted',
              description: 'The product has been successfully removed.',
          });
      } catch (error) {
          console.error("Error deleting product:", error);
          toast({
              variant: 'destructive',
              title: 'Delete Failed',
              description: 'Could not delete the product. Please try again.',
          });
      }
  };

  const handleSave = async (productData: Omit<Product, 'id' | 'imageId'>, imageFile?: File) => {
    if (!database) return;
    
    let imageId = editingProduct?.imageId || '';

    try {
        // Step 1: Handle image upload if a new file is provided
        if (imageFile) {
            // Step 1a: Get authentication parameters from our secure API endpoint
            const authResponse = await fetch('/api/upload');
            if (!authResponse.ok) {
                throw new Error('Failed to get upload authentication from server.');
            }
            const authParams = await authResponse.json();

            // Step 1b: Prepare FormData for ImageKit
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('fileName', imageFile.name);
            formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!); // Use public key from env
            formData.append('signature', authParams.signature);
            formData.append('expire', authParams.expire);
            formData.append('token', authParams.token);

            // Step 1c: Upload the image to ImageKit
            const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(`ImageKit upload failed: ${errorData.message}`);
            }
            
            const uploadResult = await uploadResponse.json();
            imageId = uploadResult.fileId; // Save the new fileId
        }

        if (!imageId) {
            throw new Error('An image is required. Please select an image to upload.');
        }

        const finalProductData = {
          ...productData,
          imageId: imageId,
        };

        // Step 2: Save product data to Firebase
        if (editingProduct) {
            // Update existing product
            const productRef = ref(database, `products/${editingProduct.key}`);
            await update(productRef, finalProductData);
            toast({
                title: 'Product Updated',
                description: 'The product has been successfully updated.',
            });
        } else {
            // Add new product
            const productsRef = ref(database, 'products');
            const newProductRef = push(productsRef);
            await set(newProductRef, finalProductData);
            toast({
                title: 'Product Added',
                description: 'The new product has been successfully added.',
            });
        }
        setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save the product. Please try again.',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button onClick={handleAddNew}>Add New Product</Button>
      </div>

      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.key}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{Array.isArray(product.category) ? product.category.join(', ') : ''}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.discount || 0}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="mr-2">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product.key)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        product={editingProduct}
      />
    </div>
  );
}
