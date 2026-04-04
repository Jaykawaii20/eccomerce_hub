import type { Metadata } from 'next';
import { CartProvider } from './context/cart-context';
import { CustomerAuthProvider } from './context/customer-auth-context';
import { StoreConfigProvider } from './context/store-config-context';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Shop our latest products',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreConfigProvider>
      <CustomerAuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </CustomerAuthProvider>
    </StoreConfigProvider>
  );
}
