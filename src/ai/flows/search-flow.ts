/**
 * @fileOverview A product search AI flow.
 *
 * This file defines the Genkit flow for performing a semantic search on products.
 * It is not intended to be called directly from the client but is used by a server action.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the shape of a single product for the AI model
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string(),
  // Ensure category is always an array of strings for the model
  category: z.array(z.string()).default([]),
});

export const SearchInputSchema = z.object({
  query: z.string().describe("The user's search query."),
  products: z
    .array(ProductSchema)
    .describe('The list of all available products.'),
});
export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchOutputSchema = z.object({
  productIds: z
    .array(z.string())
    .describe(
      "An array of product IDs that semantically match the user's query."
    ),
});
export type SearchOutput = z.infer<typeof SearchOutputSchema>;

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

// This flow is now internal to the AI system and called by the server action.
export const searchFlow = ai.defineFlow(
  {
    name: 'searchFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async (input) => {
    // In a real-world scenario, you might use a vector database for pre-filtering.
    // For this example, we're relying on the LLM's ability to sift through the provided list.
    const { output } = await prompt(input);
    return output!;
  }
);
