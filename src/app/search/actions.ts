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
  // Pass the full list to the flow to maximize semantic matching.
  // The AI is capable of sifting through the provided list to find the best matches.
  return searchFlow(input);
}
