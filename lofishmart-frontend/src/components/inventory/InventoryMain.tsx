import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useNavigate } from "@tanstack/react-router";
import {
  InventoryService,
  TransferOrderService,
  type StockItem,
  type StockTransfer,
} from "@/services/inventory.service";
import { ProductService } from "@/services/product.service";
import { ProfileService } from "@/services/profile.service";
import { SupplierService } from "@/services/supplier.service";
import { AuthService } from "@/services/auth.service";
import {
  ArrowDownCircle,
  RefreshCw,
  ArrowRightCircle,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/markets/LoadingSkeleton";
import { GudangView } from "@/components/markets/GudangView";
import { OutletView } from "@/components/markets/OutletView";

import { VerifyModal } from "@/components/markets/VerifyModal";
import { RejectModal } from "@/components/markets/RejectModal";
import { StockDetailModal } from "@/components/markets/StockDetailModal";
import { OutletDetailOverlay } from "@/components/markets/OutletDetailOverlay";
import { TransferPrintView } from "@/components/markets/TransferPrintView";
import { useRoleAndPermission, getRoleId } from "@/hooks/useRoleAndPermission";

interface InventoryMainProps {
  activeTab: "stok" | "ops";
}

type ModalType =
  | "verify"
  | "reject"
  | null;

export function InventoryMain({ activeTab }: InventoryMainProps) {
  const { isAdmin, isManager, isSupervisor, isGudang } = useRoleAndPermission();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(AuthService.getCurrentUser());

  useEffect(() => {
    // Refresh profile to get the latest market assignment from the database
    AuthService.getProfile().then(user => {
      setUserData(user);
    }).catch(err => {
      console.error("Failed to refresh user profile:", err);
    });
  }, []);

  const userRole = getRoleId(userData);
  const isGudangRole = isGudang || userRole === "GDNG";
  const isOutletRole = isSupervisor || userRole === "SPVR";
  const isManagementRole = isAdmin || isManager || userRole === "ADMN" || userRole === "MGR";

  const isScopedUser = userRole === "SPVR" || userRole === "GDNG";

  // Scoped users (SPVR/GDNG) see only their assigned market.
  // Admin/Manager see ALL data (no location filter).
  const userAssignedMarketId = userData?.market?.id || userData?.market_id || null;
  const effectiveMarketId = isScopedUser ? userAssignedMarketId : null;

  // Data state
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [allStockList, setAllStockList] = useState<StockItem[]>([]);
  const [transferOrders, setTransferOrders] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [intakeData, setIntakeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState<string | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);

  // Print state
  const [printData, setPrintData] = useState<{
    transfer: StockTransfer;
    type: "delivery" | "receipt";
  } | null>(null);

  // Load base data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allMarkets, allProducts, allSuppliers, history] = await Promise.all([
        ProfileService.getMarketProfiles(),
        ProductService.getBaseProducts(),
        SupplierService.getSuppliers(),
        InventoryService.getPurchaseList(),
      ]);

      setMarkets(allMarkets || []);
      setProducts(allProducts || []);
      setSuppliers(allSuppliers || []);
      setIntakeData(history || []);
    } catch (err) {
      console.error("Failed to load reference data:", err);
      setError("Gagal memuat data referensi");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stock
  const loadStock = useCallback(async () => {
    try {
      const queryParams: any = {};
      // If a specific location is selected (Admin/Manager) OR user is scoped (SPVR/GDNG)
      if (effectiveMarketId) {
        queryParams.market_id = String(effectiveMarketId);
      }

      const data = await InventoryService.getStockList(queryParams);
      const list = Array.isArray(data) ? data : [];

      setAllStockList(list);

      // Even if specific market is selected, management might want to see context.
      // But for the main 'stockList' used in views, we filter by selection.
      if (effectiveMarketId) {
        setStockList(list.filter(s => 
          String(s.market?.id) === String(effectiveMarketId) || 
          String(s.warehouse?.id) === String(effectiveMarketId) ||
          String(s.werehouse?.id) === String(effectiveMarketId)
        ));
      } else {
        setStockList(list);
      }
    } catch (err) {
      console.error("Failed to load stock:", err);
    }
  }, [effectiveMarketId]);

  // Load transfer orders
  const loadTransferOrders = useCallback(async () => {
    try {
      const orders = await TransferOrderService.list();
      setTransferOrders(orders);
    } catch (err) {
      console.error("Failed to load transfer orders:", err);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (markets.length > 0) {
      loadStock();
      loadTransferOrders();
    }
  }, [markets, loadStock, loadTransferOrders, refreshKey]);

  const gudangStock = allStockList.filter((s) => (s.warehouse?.type || s.werehouse?.type) === 'GUDANG');
  const outletStock = allStockList.filter((s) => s.market?.type === 'OUTLET');

  // Incoming transfers for outlet (Supervisor sees SENDING or WAITING_VERIFICATION to their outlet)
  const incomingTransfers = transferOrders.filter(
    (t) =>
      (t.status === "SENDING" || t.status === "WAITING_VERIFICATION") &&
      (isOutletRole
        ? String(t.target_market?.id) === String(effectiveMarketId)
        : true)
  );

  const handlePrint = (transfer: StockTransfer, type: "delivery" | "receipt") => {
    setPrintData({ transfer, type });
  };

  return (
    <div className="flex bg-gray-50 w-full h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title="Inventory"
          description={
            isGudangRole
              ? "Gudang — Kelola stok masuk & keluar"
              : isOutletRole
                ? "Supervisor — Stok & verifikasi barang"
                : "Manajemen Inventory Semua Lokasi"
          }
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            {(isGudangRole || isAdmin) && (
              <Button
                size="sm"
                onClick={() => navigate({ to: "/kelolagudang/receive" })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Terima Supplier
              </Button>
            )}

            {(isGudangRole || isManagementRole) && (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate({ to: "/kelolagudang/transfers" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRightCircle className="w-4 h-4 mr-2" />
                  Kirim ke Outlet
                </Button>

              </>
            )}
            {isOutletRole && (
              <>
                <Button
                  size="sm"
                  onClick={() => setActiveModal("verify")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verifikasi Terima Stok
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveModal("reject")}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Laporkan Barang Rusak
                </Button>
              </>
            )}
            </div>
        </AppHeader>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* GUDANG VIEW */}
              {(isGudangRole || isManagementRole) && (
                <GudangView
                  gudangStock={isManagementRole ? gudangStock : stockList}
                  outletStock={isManagementRole ? outletStock : []}
                  isManagement={isManagementRole}
                  intakeData={intakeData}
                  allProducts={products}
                  transferOrders={transferOrders}
                  userRole={userRole}
                  activeTab={activeTab}
                  onStockClick={(name) => setSelectedStockProduct(name)}
                  onOutletClick={(id) => setSelectedOutletId(id)}
                  onTransferSuccess={handleRefresh}
                  onPrint={handlePrint}
                />
              )}

              {/* OUTLET / SUPERVISOR VIEW */}
              {isOutletRole && (
                <OutletView
                  stockList={stockList}
                  incomingTransfers={incomingTransfers}
                  marketName={
                    markets.find((m) => String(m.id) === String(effectiveMarketId))?.name || "perlu ditambahkan"
                  }
                  userRole={userRole}
                  transferOrders={transferOrders}
                  activeTab={activeTab}
                  onSuccess={handleRefresh}
                  onVerify={() => setActiveModal("verify")}
                  onReject={() => setActiveModal("reject")}
                  onPrint={handlePrint}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      <VerifyModal
        isOpen={activeModal === "verify"}
        onClose={() => setActiveModal(null)}
        stockList={stockList}
        onSuccess={handleRefresh}
      />

      <RejectModal
        isOpen={activeModal === "reject"}
        onClose={() => setActiveModal(null)}
        products={products}
        onSuccess={handleRefresh}
        marketId={effectiveMarketId as string}
      />

      {/* DETAIL OVERLAYS */}
      <StockDetailModal
        productName={selectedStockProduct || ""}
        isOpen={!!selectedStockProduct}
        onClose={() => setSelectedStockProduct(null)}
        stocks={allStockList.filter(s => s.product?.name === selectedStockProduct && (s.warehouse?.id || s.werehouse?.id))}
        onSuccess={handleRefresh}
      />

      <OutletDetailOverlay
        outletId={selectedOutletId || ""}
        isOpen={!!selectedOutletId}
        onClose={() => setSelectedOutletId(null)}
        stocks={allStockList.filter(s => s.market?.id === selectedOutletId)}
        markets={markets}
        onSuccess={handleRefresh}
      />

      {/* PRINT VIEW */}
      {printData && (
        <TransferPrintView
          type={printData.type}
          transfer={printData.transfer}
          onClose={() => setPrintData(null)}
        />
      )}
    </div>
  );
}
