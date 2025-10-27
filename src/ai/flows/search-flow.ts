'use server';
/**
 * @fileOverview A product search AI flow.
 *
 * - searchProducts - A function that handles the product search process.
 * - SearchInput - The input type for the searchProducts function.
 * - SearchOutput - The return type for the searchProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product } from '@/lib/types';

// Define the shape of a single product for the AI model
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string(),
  category: z.array(z.string()),
});

export const SearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
  products: z.array(ProductSchema).describe('The list of all available products.'),
});
export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An array of product IDs that semantically match the user\'s query.'),
});
export type SearchOutput = z.infer<typeof SearchOutputSchema>;

export async function searchProducts(input: SearchInput): Promise<SearchOutput> {
  // Filter out products that are obviously not relevant to speed up the process
  // In a real-world scenario, you'd use a vector database for this.
  const lowerQuery = input.query.toLowerCase();
  const candidateProducts = input.products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.category.some(c => c.toLowerCase().includes(lowerQuery))
  );

  // If we have many candidates, we can pass them to the LLM.
  // For this example, we'll pass the full list to show the capability.
  return searchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: { schema: SearchInputSchema },
  output: { schema: SearchOutputSchema },
  prompt: `You are an expert product recommender for a perfume store. Your task is to find products that are a good semantic match for a user's search query.

Analyze the user's query: "{{query}}"

Consider the following list of available products:
{{#each products}}
- Product ID: {{id}}
  Name: {{name}}
  Brand: {{brand}}
  Description: {{description}}
  Categories: {{#each category}}{{.}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Based on the query, return the product IDs of the items that are the best semantic fit. For example, if the query is "a scent for summer", you should look for products with descriptions that mention "fresh", "citrus", "oceanic", or "light floral" notes, even if the word "summer" isn't there.

Return ONLY the matching product IDs in the specified output format. Do not include products that are only a weak match. If no products are a good match, return an empty array.`,
});

const searchFlow = ai.defineFlow(
  {
    name: 'searchFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
