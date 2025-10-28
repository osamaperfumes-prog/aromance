'use server';
/**
 * @fileOverview Server action for handling product search.
 */

import { searchFlow, type SearchInput, type SearchOutput } from "@/ai/flows/search-flow";

/**
 * Executes the product search AI flow.
 * This is a server action that can be called from client components.
 * @param input The search query and list of products.
 * @returns A promise that resolves to the search results.
 */
export async function searchProducts(input: SearchInput): Promise<SearchOutput> {
  // Here you could add additional logic, like filtering products before sending to the AI
  const lowerQuery = input.query.toLowerCase();
  const candidateProducts = input.products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      (Array.isArray(p.category) && p.category.some((c) => c.toLowerCase().includes(lowerQuery)))
  );

  // For this example, we'll still pass the full list to the flow to maximize semantic matching,
  // but the keyword filtering is a good practice for larger datasets.
  return searchFlow(input);
}
