import { Footer } from './footer';
import { Header } from './header';

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      <div className=' mt-14 mb-24'>{children}</div>
      <Footer />
    </div>
  );
};
