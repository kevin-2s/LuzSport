import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { Button } from '../atoms/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  EyeOff
} from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchColumnId?: string;
  urlSyncPrefix?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Buscar...',
  urlSyncPrefix,
}: DataTableProps<TData, TValue>) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled State with URL synchronization if prefix is provided
  const initialPageIndex = useMemo(() => {
    if (!urlSyncPrefix) return 0;
    const pageParam = searchParams.get(`${urlSyncPrefix}_page`);
    return pageParam ? Math.max(0, parseInt(pageParam, 10) - 1) : 0;
  }, [searchParams, urlSyncPrefix]);

  const initialPageSize = useMemo(() => {
    if (!urlSyncPrefix) return 10;
    const sizeParam = searchParams.get(`${urlSyncPrefix}_size`);
    return sizeParam ? parseInt(sizeParam, 10) : 10;
  }, [searchParams, urlSyncPrefix]);

  const initialGlobalFilter = useMemo(() => {
    if (!urlSyncPrefix) return '';
    return searchParams.get(`${urlSyncPrefix}_search`) || '';
  }, [searchParams, urlSyncPrefix]);

  // States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Sync state to URL search parameters
  useEffect(() => {
    if (!urlSyncPrefix) return;

    const newParams = new URLSearchParams(searchParams);
    
    if (pageIndex > 0) {
      newParams.set(`${urlSyncPrefix}_page`, (pageIndex + 1).toString());
    } else {
      newParams.delete(`${urlSyncPrefix}_page`);
    }

    if (pageSize !== 10) {
      newParams.set(`${urlSyncPrefix}_size`, pageSize.toString());
    } else {
      newParams.delete(`${urlSyncPrefix}_size`);
    }

    if (globalFilter) {
      newParams.set(`${urlSyncPrefix}_search`, globalFilter);
    } else {
      newParams.delete(`${urlSyncPrefix}_search`);
    }

    setSearchParams(newParams, { replace: true });
  }, [pageIndex, pageSize, globalFilter, urlSyncPrefix, setSearchParams, searchParams]);

  // Table instance configuration
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Controls Area */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Search Filter */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-textSecondary" />
          <input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-neutral-textPrimary placeholder:text-neutral-textDisabled"
          />
        </div>

        {/* Column Visibility Control */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-textSecondary border border-neutral-border bg-white rounded-lg hover:text-neutral-textPrimary hover:bg-slate-50 transition-colors">
              <EyeOff className="h-3.5 w-3.5" />
              Columnas
            </button>
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-neutral-border rounded-lg shadow-lg py-1.5 hidden group-hover:block hover:block z-10 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-1 border-b border-neutral-border text-[10px] font-bold text-neutral-textDisabled tracking-wide uppercase">
                Mostrar Columnas
              </div>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-bg text-xs text-neutral-textPrimary font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                      className="rounded border-neutral-border text-primary focus:ring-primary"
                    />
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </label>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-textPrimary border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-neutral-border bg-slate-50/50">
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="py-3.5 px-4 font-bold text-neutral-textSecondary tracking-wide text-xs select-none"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-1.5 ${
                              header.column.getCanSort() ? 'cursor-pointer hover:text-neutral-textPrimary' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="text-slate-400">
                                {isSorted === 'asc' && <ArrowUp className="h-3.5 w-3.5" />}
                                {isSorted === 'desc' && <ArrowDown className="h-3.5 w-3.5" />}
                                {!isSorted && <ArrowUpDown className="h-3.5 w-3.5" />}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-neutral-textSecondary text-sm">
                    <span className="loading loading-infinity loading-lg text-primary mx-auto mb-2 block"></span>
                    Cargando información...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-neutral-textSecondary text-sm">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-neutral-border hover:bg-neutral-bg/30 transition-colors ${
                      row.getIsSelected() ? 'bg-primary-light/10 hover:bg-primary-light/20' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 text-sm align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Information Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2 py-1">
        {/* Selected Rows & Total Records Info */}
        <div className="text-xs text-neutral-textSecondary font-semibold">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>

        {/* Navigation & Limit Control */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-end">
          {/* Page Size limit selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-textSecondary font-semibold">Filas por página:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-white border border-neutral-border rounded-lg text-xs font-semibold px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-textPrimary"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Current Page info */}
          <div className="text-xs text-neutral-textSecondary font-semibold">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="p-1.5 rounded-lg border-neutral-border text-neutral-textSecondary disabled:opacity-50 !px-2.5 !py-2 shadow-none hover:shadow-none hover:-translate-y-0"
              title="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="p-1.5 rounded-lg border-neutral-border text-neutral-textSecondary disabled:opacity-50 !px-2.5 !py-2 shadow-none hover:shadow-none hover:-translate-y-0"
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="p-1.5 rounded-lg border-neutral-border text-neutral-textSecondary disabled:opacity-50 !px-2.5 !py-2 shadow-none hover:shadow-none hover:-translate-y-0"
              title="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="p-1.5 rounded-lg border-neutral-border text-neutral-textSecondary disabled:opacity-50 !px-2.5 !py-2 shadow-none hover:shadow-none hover:-translate-y-0"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
