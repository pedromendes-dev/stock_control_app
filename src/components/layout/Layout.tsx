import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-muted/40 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
