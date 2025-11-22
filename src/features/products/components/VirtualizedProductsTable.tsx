import React, { useRef, useState, useCallback, useLayoutEffect } from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Product, Category } from "@/types";

interface Props {
  products: Product[];
  categories: Category[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

const ROW_HEIGHT = 56; // px
const CONTAINER_HEIGHT = 600; // px
const OVERSCAN = 5; // extra rows above/below viewport

export const VirtualizedProductsTable: React.FC<Props> = ({
  products,
  categories,
  onEdit,
  onDelete,
  deletingId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const total = products.length;

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Recalcular quando produtos mudarem (ex.: paginação server side poderia trocar lista)
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [products]);

  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    total - 1,
    startIndex + visibleCount + OVERSCAN * 2
  );

  const items: Product[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const p = products[i];
    if (p) items.push(p);
  }

  const offsetY = startIndex * ROW_HEIGHT;
  const remainingHeight = (total - endIndex - 1) * ROW_HEIGHT;

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      style={{
        maxHeight: CONTAINER_HEIGHT,
        overflowY: "auto",
        position: "relative",
      }}
      role="rowgroup"
      aria-rowcount={total}
      data-virtualized
    >
      <TableBody>
        {offsetY > 0 && (
          <tr style={{ height: offsetY }} aria-hidden="true">
            <td colSpan={5} style={{ padding: 0, border: 0 }} />
          </tr>
        )}
        {items.map((product) => {
          const catName = categories.find(
            (c) => c.id === product.categoryId
          )?.name;
          return (
            <TableRow
              key={product.id}
              role="row"
              style={{ height: ROW_HEIGHT }}
            >
              <TableCell>
                <div className="font-medium" title={product.name}>
                  {product.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.sku}
                </div>
              </TableCell>
              <TableCell>{catName}</TableCell>
              <TableCell className="text-right">
                R$ {product.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    product.currentStock <= product.minStock
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {product.currentStock}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      aria-label={`Ações para ${product.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>Visualizar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? "Excluindo..." : "Excluir"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
        {remainingHeight > 0 && (
          <tr style={{ height: remainingHeight }} aria-hidden="true">
            <td colSpan={5} style={{ padding: 0, border: 0 }} />
          </tr>
        )}
      </TableBody>
    </div>
  );
};
