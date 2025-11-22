import { NavLink } from 'react-router-dom';
import { Package, Home, BarChart3, Settings, Warehouse, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Boxes className="h-6 w-6 text-primary" />
          <span>StockControl</span>
        </NavLink>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <NavItem icon={<Home className="h-4 w-4" />} to="/dashboard">
          Dashboard
        </NavItem>
        <NavItem icon={<Package className="h-4 w-4" />} to="/produtos">
          Produtos
        </NavItem>
        <NavItem icon={<Warehouse className="h-4 w-4" />} to="/estoque">
          Estoque
        </NavItem>
        <NavItem icon={<BarChart3 className="h-4 w-4" />} to="/relatorios">
          Relatórios
        </NavItem>
        <NavItem icon={<Settings className="h-4 w-4" />} to="/configuracoes">
          Configurações
        </NavItem>
      </nav>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavItem = ({ to, icon, children }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-muted text-primary'
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
};

export default Sidebar;
