export interface SearchProductResult {
  id: string;
  name: string;
  category: string;
  price_inr: number;
  image_url: string;
}

export interface SearchQueryParams {
  query: string;
  limit?: number;
}

export interface SearchResponse {
  products: SearchProductResult[];
  categories: string[];
  totalCount: number;
}
