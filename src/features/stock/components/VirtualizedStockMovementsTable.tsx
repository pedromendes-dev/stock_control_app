import React, { useRef, useState, useCallback, useLayoutEffect } from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { StockMovement } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  movements: StockMovement[];
  onScrollThreshold?: (ratio: number) => void; // chamado quando scroll ratio >= 0.7
}

// Mantém mesmos parâmetros de produtos para consistência
const ROW_HEIGHT = 56; // px
const CONTAINER_HEIGHT = 600; // px
const OVERSCAN = 5; // linhas extras acima/abaixo

export const VirtualizedStockMovementsTable: React.FC<Props> = ({
  movements,
  onScrollThreshold,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const total = movements.length;

  const thresholdTriggeredRef = useRef(false);

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      setScrollTop(el.scrollTop);
      if (onScrollThreshold) {
        const totalHeight = total * ROW_HEIGHT;
        const ratio =
          totalHeight > el.clientHeight
            ? el.scrollTop / (totalHeight - el.clientHeight)
            : 0;
        if (!thresholdTriggeredRef.current && ratio >= 0.7) {
          thresholdTriggeredRef.current = true;
          onScrollThreshold(ratio);
        }
      }
    }
  }, [onScrollThreshold, total]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [movements]);

  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    total - 1,
    startIndex + visibleCount + OVERSCAN * 2
  );

  const items: StockMovement[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const m = movements[i];
    if (m) items.push(m);
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
        {items.map((mov) => {
          const globalIndex = movements.indexOf(mov); // O(N) mas lista já está em memória; aceitável dado custo baixo
          return (
            <TableRow
              key={mov.id}
              role="row"
              style={{ height: ROW_HEIGHT }}
              aria-rowindex={globalIndex + 1}
            >
              <TableCell className="font-medium" title={mov.productName}>
                {mov.productName}
              </TableCell>
              <TableCell>
                <Badge
                  variant={mov.type === "ENTRADA" ? "default" : "destructive"}
                >
                  {mov.type}
                </Badge>
              </TableCell>
              <TableCell>{mov.reason}</TableCell>
              <TableCell className="text-right font-medium">
                {mov.quantity}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {format(new Date(mov.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
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
