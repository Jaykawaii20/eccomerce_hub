import type { Metadata } from 'next';
import { CartProvider } from './context/cart-context';
import { CustomerAuthProvider } from './context/customer-auth-context';
import { StoreConfigProvider } from './context/store-config-context';
import { AuthModalProvider } from './context/auth-modal-context';
import { AuthModal } from './components/auth-modal';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Shop our latest products',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreConfigProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
          </AuthModalProvider>
        </CartProvider>
      </CustomerAuthProvider>
    </StoreConfigProvider>
  );
}
