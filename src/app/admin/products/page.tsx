'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ProductWithId = Product & { id: string };

export default function AdminProductsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithId | null>(
    null
  );

  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  useEffect(() => {
    if (!productsCollection) return;

    const q = query(productsCollection);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList: ProductWithId[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, 'id'>),
        }));
        setProducts(productsList.reverse());
        setIsLoading(false);
      },
      async (err) => {
        console.error('Error fetching products:', err);
        const permissionError = new FirestorePermissionError({
            path: productsCollection.path,
            operation: 'list',
          });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch products.',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productsCollection, toast]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: ProductWithId) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this product?'))
      return;

    const docRef = doc(firestore, `products/${productId}`);
    deleteDoc(docRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the product. Please try again.',
      });
    });
    toast({
      title: 'Product Deleted',
      description: 'The product has been successfully removed.',
    });
  };

  const handleSave = async (
    productData: Omit<Product, 'id' | 'imageId'>,
    imageFile?: File
  ) => {
    if (!firestore || !productsCollection) return;

    let imageId = editingProduct?.imageId || '';

    try {
      if (imageFile) {
        // Request authentication parameters from your server, now sending the filename
        const authResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName: imageFile.name }),
        });

        if (!authResponse.ok) {
          throw new Error('Failed to get upload authentication from server.');
        }
        const authParams = await authResponse.json();

        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('fileName', imageFile.name);
        // Ensure you use the public key from environment variables
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
        formData.append('signature', authParams.signature);
        formData.append('expire', authParams.expire);
        formData.append('token', authParams.token);

        const uploadResponse = await fetch(
          'https://upload.imagekit.io/api/v1/files/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(`ImageKit upload failed: ${errorData.message}`);
        }

        const uploadResult = await uploadResponse.json();
        imageId = uploadResult.fileId;
      }

      if (!imageId && !editingProduct?.imageId) {
        throw new Error(
          'An image is required. Please select an image to upload.'
        );
      }

      const finalProductData = {
        ...productData,
        imageId: imageId,
        createdAt: serverTimestamp(),
      };

      if (editingProduct) {
        const docRef = doc(firestore, `products/${editingProduct.id}`);
        updateDoc(docRef, finalProductData)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: finalProductData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: 'Could not update the product. Please try again.',
                });
            });
        toast({
          title: 'Product Updated',
          description: 'The product has been successfully updated.',
        });
      } else {
        addDoc(productsCollection, finalProductData)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: productsCollection.path,
                    operation: 'create',
                    requestResourceData: finalProductData,
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    variant: 'destructive',
                    title: 'Save Failed',
                    description: 'Could not save the new product. Please try again.',
                });
            });
        toast({
          title: 'Product Added',
          description: 'The new product has been successfully added.',
        });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description:
          error.message || 'Could not save the product. Please try again.',
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
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      {Array.isArray(product.category)
                        ? product.category.join(', ')
                        : ''}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.discount || 0}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
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
