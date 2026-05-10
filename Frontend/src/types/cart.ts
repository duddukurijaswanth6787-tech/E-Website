export interface CartItem {
  id: string; // Typically productId
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  fabric?: string;
  customizations?: {
    stitchingRequired: boolean;
    measurements?: Record<string, string>;
  };
}
