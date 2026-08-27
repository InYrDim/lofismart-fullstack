import { useState, useMemo } from "react";
import { Warehouse, Package, Store, TrendingUp, Filter, Calendar, Check, ChevronsUpDown, Scale, Fish, Truck } from "lucide-react";
import { IntakeChart } from "@/components/inventory/IntakeChart";
import { SummaryCard } from "./SummaryCard";
import { Select } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransferOrderList } from "./TransferOrderList";
import { type StockItem, type StockTransfer } from "@/services/inventory.service";
import { formatQty } from "@/utils/format";

interface GudangViewProps {
  gudangStock: StockItem[];
  outletStock: StockItem[];
  isManagement: boolean;
  intakeData: StockItem[];
  allProducts: { name: string;[key: string]: unknown }[];
  transferOrders: StockTransfer[];
  userRole: string | undefined;
  activeTab: "stok" | "ops";
  onStockClick: (product: string) => void;
  onOutletClick: (outletId: string) => void;
  onTransferSuccess: () => void;
  onPrint: (transfer: StockTransfer, type: "delivery" | "receipt") => void;
}

export function GudangView({
  gudangStock,
  outletStock,
  isManagement,
  intakeData,
  allProducts,
  transferOrders,
  userRole,
  activeTab,
  onStockClick,
  onOutletClick,
  onTransferSuccess,
  onPrint,
}: GudangViewProps) {
  const [chartDays, setChartDays] = useState(30);
  const [selectedChartProducts, setSelectedChartProducts] = useState<string[]>([]);
  const [productFilterOpen, setProductFilterOpen] = useState(false);

  const totalGudangKg = gudangStock.filter(s => s.unit === "1").reduce((sum, s) => sum + s.qty, 0);
  const totalGudangEkor = gudangStock.filter(s => s.unit === "2").reduce((sum, s) => sum + s.qty, 0);

  const totalOutletKg = outletStock.filter(s => s.unit === "1").reduce((sum, s) => sum + s.qty, 0);
  const totalOutletEkor = outletStock.filter(s => s.unit === "2").reduce((sum, s) => sum + s.qty, 0);

  // In-transit stock (SENDING, WAITING_VERIFICATION)
  const transitOrders = transferOrders.filter(t => t.status === "SENDING" || t.status === "WAITING_VERIFICATION");
  const totalTransitKg = transitOrders.filter(t => t.unit === "1").reduce((sum, t) => sum + t.qty, 0);
  const totalTransitEkor = transitOrders.filter(t => t.unit === "2").reduce((sum, t) => sum + t.qty, 0);

  // Available products for filtering (from all sources)
  const availableProducts = useMemo(() => {
    const products = new Set<string>();
    // First, products from database
    allProducts.forEach(p => products.add(p.name));
    // Then, products from stock (in case they aren't in allProducts somehow)
    gudangStock.forEach(s => s.product?.name && products.add(s.product.name));
    outletStock.forEach(s => s.product?.name && products.add(s.product.name));
    intakeData.forEach(p => p.product?.name && products.add(p.product.name));

    return Array.from(products).sort();
  }, [allProducts, gudangStock, outletStock, intakeData]);

  const toggleProductFilter = (name: string) => {
    setSelectedChartProducts(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  // Group stok per gudang (GUDANG ONLY)
  const stockPerGudang: Record<string, { name: string; items: StockItem[] }> = {};
  gudangStock.forEach((s) => {
    const gId = s.warehouse?.id || s.werehouse?.id || "unknown-gudang";
    const gName = s.warehouse?.name || s.werehouse?.name || "Gudang Utama";
    if (!stockPerGudang[gId]) stockPerGudang[gId] = { name: gName, items: [] };
    stockPerGudang[gId].items.push(s);
  });

  // Group gudang stock by product (Aggregated across all warehouses)
  const gudangByProduct: Record<string, { name: string; qty: number; unit: string; batches: string[] }> = {};
  gudangStock.forEach((s) => {
    const name = s.product?.name || "Unknown";
    if (!gudangByProduct[name]) {
      gudangByProduct[name] = { name, qty: 0, unit: s.unit, batches: [] };
    }
    gudangByProduct[name].qty += s.qty;
    if (s.batch) gudangByProduct[name].batches.push(s.batch);
  });

  // Group transit stock by product
  const transitByProduct: Record<string, { name: string; qty: number; unit: string }> = {};
  transitOrders.forEach((t) => {
    const name = t.product?.name || "Unknown";
    if (!transitByProduct[name]) {
      transitByProduct[name] = { name, qty: 0, unit: t.unit };
    }
    transitByProduct[name].qty += t.qty;
  });

  // Group outlet stock per market (for management)
  const stockPerOutlet: Record<string, { name: string; items: StockItem[] }> = {};
  if (isManagement) {
    outletStock.forEach((s) => {
      const mId = s.market?.id || "unknown-market";
      const mName = s.market?.name || "Outlet";
      if (!stockPerOutlet[mId]) stockPerOutlet[mId] = { name: mName, items: [] };
      stockPerOutlet[mId].items.push(s);
    });
  }

  return (
    <div className="space-y-8">
      {activeTab === "stok" ? (
        <>
          {/* Summary Cards */}
          <div className={`grid gap-4 ${isManagement ? "grid-cols-1 md:grid-cols-4" : "grid-cols-2"}`}>
            <SummaryCard
              icon={<Warehouse className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              label="Jenis Barang"
              value={`${Object.keys(gudangByProduct).length} jenis`}
            />
            <SummaryCard
              icon={<Package className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-100"
              label="Stok Gudang"
              value={
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-2">
                  <span className="text-xl font-bold">{formatQty(totalGudangKg)} <small className="text-[10px] font-normal text-gray-400 uppercase">kg</small></span>
                  <span className="text-gray-200 hidden sm:inline">|</span>
                  <span className="text-xl font-bold">{formatQty(totalGudangEkor)} <small className="text-[10px] font-normal text-gray-400 uppercase">ekor</small></span>
                </div>
              }
            />
            {isManagement && (
              <>
                <SummaryCard
                  icon={<Truck className="w-5 h-5 text-orange-600" />}
                  iconBg="bg-orange-100"
                  label="Dalam Pengiriman"
                  value={
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-2">
                      <span className="text-xl font-bold text-orange-700">{formatQty(totalTransitKg)} <small className="text-[10px] font-normal text-orange-400 uppercase">kg</small></span>
                      <span className="text-gray-200 hidden sm:inline">|</span>
                      <span className="text-xl font-bold text-orange-700">{formatQty(totalTransitEkor)} <small className="text-[10px] font-normal text-orange-400 uppercase">ekor</small></span>
                    </div>
                  }
                />
                <SummaryCard
                  icon={<Store className="w-5 h-5 text-blue-600" />}
                  iconBg="bg-blue-100"
                  label="Stok Semua Outlet"
                  value={
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-2">
                      <span className="text-xl font-bold text-blue-700">{formatQty(totalOutletKg)} <small className="text-[10px] font-normal text-blue-400 uppercase">kg</small></span>
                      <span className="text-gray-200 hidden sm:inline">|</span>
                      <span className="text-xl font-bold text-blue-700">{formatQty(totalOutletEkor)} <small className="text-[10px] font-normal text-blue-400 uppercase">ekor</small></span>
                    </div>
                  }
                />
              </>
            )}
          </div>

          {/* 1. Stok Tiap Gudang */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-emerald-50/50">
              <Warehouse className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-emerald-900 tracking-tight">Stok Tiap Gudang</h2>
            </div>
            <div className="p-6">
              {Object.keys(stockPerGudang).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Warehouse className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Tidak ada stok di gudang</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(stockPerGudang).map((gudang) => (
                    <div key={gudang.name} className="flex flex-col border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Warehouse className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">{gudang.name}</h3>
                      </div>
                      <div className="space-y-3">
                        {gudang.items.length === 0 ? (
                          <p className="text-xs text-center text-gray-400 py-2">Kosong</p>
                        ) : (
                          gudang.items.map((s) => (
                            <div key={s.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 font-medium">{s.product?.name}</span>
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">
                                {formatQty(Number(s.qty))} {s.unit === "1" ? "KG" : "EKOR"}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Stok Sedang Dikirim */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-orange-50/50">
              <Truck className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-orange-900 tracking-tight">Stok Sedang Dikirim </h2>
            </div>
            <div className="p-6">
              {Object.keys(transitByProduct).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Truck className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Tidak ada barang dalam pengiriman</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(transitByProduct).map((item) => (
                    <div key={item.name} className="bg-white border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
                      <div className="p-3 bg-orange-100/50 rounded-xl">
                        <Fish className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Produk</p>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm font-bold text-orange-600 mt-1">
                          {formatQty(Number(item.qty))} {item.unit === "1" ? "KG" : "EKOR"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Stok Tiap Outlet */}
          {isManagement && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-blue-50/50">
                <Store className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-blue-900 tracking-tight">Stok Tiap Outlet</h2>
              </div>
              <div className="p-6">
                {Object.keys(stockPerOutlet).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Store className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Belum ada data stok di outlet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(stockPerOutlet).map((outlet) => (
                      <div
                        key={outlet.name}
                        className="flex flex-col border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => {
                          const mId = Object.keys(stockPerOutlet).find(key => stockPerOutlet[key].name === outlet.name);
                          if (mId) onOutletClick(mId);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-blue-100 group-hover:bg-blue-600 transition-colors rounded-lg">
                            <Store className="w-4 h-4 text-blue-600 group-hover:text-white" />
                          </div>
                          <h3 className="font-bold text-gray-900">{outlet.name}</h3>
                        </div>
                        <div className="space-y-3">
                          {outlet.items.length === 0 ? (
                            <p className="text-xs text-center text-gray-400 py-2">Kosong</p>
                          ) : (
                            <>
                              {outlet.items.slice(0, 5).map((s) => (
                                <div key={s.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium">{s.product?.name}</span>
                                  <span className="font-bold text-blue-600">
                                    {formatQty(Number(s.qty))} {s.unit === "1" ? "KG" : "EKOR"}
                                  </span>
                                </div>
                              ))}
                              {outlet.items.length > 5 && (
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest pt-2">
                                  + {outlet.items.length - 5} Produk Lainnya
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* ── Product Intake Chart (Management Only) ── */}
          {isManagement && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Pemasukan Produk
                  </h2>
                  <p className="text-sm text-gray-500">Series pemasukan stok berdasarkan waktu & produk</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400 ml-1" />
                    <Select
                      value={String(chartDays)}
                      onChange={(val) => setChartDays(Number(val))}
                      options={[
                        { label: "7 Hari", value: "7" },
                        { label: "30 Hari", value: "30" },
                        { label: "90 Hari", value: "90" },
                      ]}
                      className="h-8 border-none bg-transparent text-xs font-semibold focus:ring-0 w-24"
                    />
                  </div>
                  <div className="h-6 w-px bg-gray-200 mx-1" />
                  <button
                    onClick={() => setSelectedChartProducts([])}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* Product Filter Combobox */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Filter className="w-3 h-3" />
                  Produk:
                </div>

                <Popover open={productFilterOpen} onOpenChange={setProductFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={productFilterOpen}
                      className="w-full md:w-[300px] justify-between text-xs font-medium bg-white border-gray-200 hover:bg-gray-50 h-10 px-3"
                    >
                      <div className="flex gap-1 truncate max-w-full">
                        {selectedChartProducts.length === 0 ? (
                          <span className="text-emerald-600 font-bold">Semuanya</span>
                        ) : (
                          selectedChartProducts.map(name => (
                            <Badge key={name} variant="secondary" className="text-[10px] font-semibold h-5 px-1 bg-emerald-50 text-emerald-700 border-emerald-100">
                              {name}
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari produk..." className="text-xs h-9" />
                      <CommandList>
                        <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => setSelectedChartProducts([])}
                            className="text-xs font-bold text-emerald-600"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedChartProducts.length === 0 ? "opacity-100" : "opacity-0"}`}
                            />
                            Semuanya (Pilih Semua)
                          </CommandItem>
                          {availableProducts.map((name) => (
                            <CommandItem
                              key={name}
                              onSelect={() => toggleProductFilter(name)}
                              className="text-xs"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${selectedChartProducts.includes(name) ? "opacity-100" : "opacity-0"}`}
                              />
                              {name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedChartProducts.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedChartProducts([])}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 h-8 px-2"
                  >
                    Bersihkan
                  </Button>
                )}
              </div>

              {intakeData.length === 0 ? (
                <div className="h-[350px] w-full mt-4 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <TrendingUp className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">Belum ada data pemasukan</p>
                  <p className="text-xs text-gray-400 mt-1">Lakukan penerimaan barang dari supplier untuk melihat grafik</p>
                </div>
              ) : (
                <IntakeChart
                  data={intakeData}
                  days={chartDays}
                  filterProducts={selectedChartProducts}
                  allProducts={availableProducts}
                />
              )}
            </div>
          )}

          {/* Transfer Orders — Pengiriman Berjalan */}
          {transferOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-orange-50">
                <Truck className="w-5 h-5 text-orange-600" />
                <h2 className="font-semibold text-orange-800">Pengiriman Stok ke Outlet</h2>
                <span className="ml-auto text-sm text-orange-600 font-medium">
                  {transferOrders.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').length} aktif
                </span>
              </div>
              <div className="p-4">
                <TransferOrderList
                  transfers={transferOrders}
                  userRole={userRole}
                  onSuccess={onTransferSuccess}
                  onPrint={onPrint}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
