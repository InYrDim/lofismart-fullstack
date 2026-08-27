import { useState, useEffect, useCallback } from "react";
import { Package, RefreshCw, AlertCircle, TrendingUp, ClipboardList } from "lucide-react";
import { InventoryService, type StockItem } from "@/services/inventory.service";
import { useRoleAndPermission, getRoleId } from "@/hooks/useRoleAndPermission";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatQty } from "@/utils/format";

/**
 * Supervisor Stock View - Dedicated stock view for SPVR role
 * Shows real-time stock count for the supervisor's assigned outlet
 */
export function SupervisorStockView() {
  const { user } = useAuth();
  const { isSupervisor } = useRoleAndPermission();
  
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[SupervisorStockView] Loading stocks...");
      console.log("[SupervisorStockView] User:", user);
      console.log("[SupervisorStockView] User market_id:", user?.market_id);
      
      // Fetch stock list - backend will filter by user's market_id automatically
      const data = await InventoryService.getStockList();
      
      console.log("[SupervisorStockView] Raw API response:", data);
      console.log("[SupervisorStockView] Number of stocks:", data?.length);
      
      // Filter to only show market stocks (not warehouse)
      const marketStocks = (data || []).filter(s => s.market?.id || !s.werehouse?.id);
      
      console.log("[SupervisorStockView] Filtered market stocks:", marketStocks);
      marketStocks.forEach(stock => {
        console.log(`  - ${stock.product?.name}: ${stock.qty} ${stock.unit === '1' ? 'KG' : 'EKOR'} @ ${stock.market?.name || stock.werehouse?.name || 'Unknown'}`);
      });
      
      setStocks(marketStocks);
      
      if (marketStocks.length === 0) {
        console.warn("[SupervisorStockView] No stocks found for this outlet!");
      }
    } catch (err) {
      console.error("[SupervisorStockView] Failed to load stocks:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat stok");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  // Calculate summary stats
  const totalProducts = stocks.length;
  const totalQty = stocks.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
  const lowStockCount = stocks.filter(s => Number(s.qty) < 5).length;
  const criticalStockCount = stocks.filter(s => Number(s.qty) === 0).length;

  if (!isSupervisor) {
    return (
      <div className="flex items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-amber-500 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Akses Ditolak</h3>
          <p className="text-gray-500">Halaman ini khusus untuk Supervisor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stok Outlet</h1>
          <p className="text-gray-500 text-sm">
            {user?.market?.name || user?.market_id || "Outlet Anda"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium">Total Produk</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">{totalProducts}</p>
            <p className="text-xs text-blue-600 mt-1">jenis barang</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total Qty</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-900">
              {formatQty(totalQty)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">total stok</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Stok Rendah</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-900">{lowStockCount}</p>
            <p className="text-xs text-amber-600 mt-1">&lt; 5 barang</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-red-700">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-medium">Stok Habis</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-900">{criticalStockCount}</p>
            <p className="text-xs text-red-600 mt-1">0 barang</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Detail Stok</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-500">Memuat data stok...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-600">Belum ada stok</p>
              <p className="text-sm">Outlet ini belum menerima barang dari gudang</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Satuan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stocks.map((stock) => {
                    const qty = Number(stock.qty) || 0;
                    const unitLabel = stock.unit === "1" ? "KG" : "EKOR";
                    const statusConfig =
                      qty === 0
                        ? { bg: "bg-red-100", text: "text-red-700", label: "Habis" }
                        : qty < 3
                        ? { bg: "bg-red-100", text: "text-red-700", label: "Kritis" }
                        : qty < 5
                        ? { bg: "bg-amber-100", text: "text-amber-700", label: "Rendah" }
                        : { bg: "bg-emerald-100", text: "text-emerald-700", label: "Normal" };

                    return (
                      <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {stock.product?.image ? (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/upload/product/${stock.product.image}`}
                                alt={stock.product?.name || "Product"}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {stock.product?.name || "Tidak diketahui"}
                              </p>
                              {stock.product?.barcode && (
                                <p className="text-xs text-gray-400">
                                  {stock.product.barcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {stock.batch ? (
                            <Badge variant="outline" className="font-mono">
                              {stock.batch}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900 text-lg">
                            {formatQty(qty)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className="bg-gray-100 text-gray-700 font-medium">
                            {unitLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info (can be removed in production) */}
      {import.meta.env.DEV && (
        <Card className="border-dashed border-gray-300 bg-gray-50">
          <CardHeader>
            <h3 className="text-sm font-mono text-gray-600">Debug Info</h3>
          </CardHeader>
          <CardContent className="text-xs font-mono text-gray-600 space-y-1">
            <p>User ID: {user?.id}</p>
            <p>Role: {getRoleId(user)}</p>
            <p>Market ID: {user?.market_id}</p>
            <p>Market Name: {typeof user?.market?.name === 'string' ? user.market.name : 'N/A'}</p>
            <p>Total Stocks: {stocks.length}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
