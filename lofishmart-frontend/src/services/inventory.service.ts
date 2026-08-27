import { api } from "@/utils/api";
import type { Purchase, StockTransfer } from "@/types";

// Re-export shared domain types so consumers can import them from here
// (components currently import `StockTransfer` from this module).
export type { Purchase, StockTransfer } from "@/types";

/**
 * Inventory Service
 * 
 * Handles all inventory-related API calls:
 * - Receive stock from supplier (gudang)
 * - Transfer stock to outlet (market)
 * - Inventory dashboard (stock overview per location)
 * - Stock list per market
 */

export interface ReceiveStockPayload {
  supplier_id: string;
  warehouse_id: string;
  product_id: string;
  purchased_qty: number;
  accepted_qty: number;
  rejected_qty?: number;
  reject_reason?: string;
  price: number;
  batch?: string;
  unit: string; // '1' = KG, '2' = PCS
  proof?: File;
}

export interface ReceiveBulkStockPayload {
  supplier_id: string;
  warehouse_id: string;
  items: {
    product_id: string;
    purchased_qty: number;
    accepted_qty: number;
    rejected_qty?: number;
    reject_reason?: string;
    price: number;
    batch?: string;
    unit: string;
  }[];
  proof?: File;
}

export interface TransferStockPayload {
  source_stock_id: string;
  market_id: string;
  product_id: string;
  transfer_qty: number;
  accepted_qty: number;
  rejected_qty?: number;
  reject_reason?: string;
  unit: string;
}

export interface StockItem {
  id: string;
  batch: string | null;
  barcode: string | null;
  unit: '1' | '2';
  qty: number;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    barcode: string | null;
    image: string | null;
  } | null;
  market: {
    id: string;
    name: string;
    type?: 'GUDANG' | 'OUTLET';
  } | null;
  /** Canonical key — backend returns this from Stock.warehouse relation */
  warehouse: {
    id: string;
    name: string;
    type?: 'GUDANG' | 'OUTLET';
  } | null;
  /** Legacy alias — some older data may use this key */
  werehouse: {
    id: string;
    name: string;
    type?: 'GUDANG' | 'OUTLET';
  } | null;
}

export interface InventoryDashboardData {
  marketId: string;
  marketName: string;
  [productName: string]: number | string;
}

export interface StockListResponse {
  data: StockItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RejectRequest {
  id: string;
  qty: number;
  desc: string;
  proof_file: string | null;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    name?: string;
  };
  approved_by?: {
    id: string;
    username: string;
  };
  stock?: {
    id: string;
    unit?: "1" | "2";
    product?: { id: string; name: string };
    market?: { id: string; name: string };
    werehouse?: { id: string; name: string };
  };
}

export const InventoryService = {
  /**
   * Get inventory dashboard - overview of stock per market/location
   */
  getDashboard: async (): Promise<InventoryDashboardData[]> => {
    try {
      const response = await api.get<{ data: InventoryDashboardData[] }>(
        "/product/inventory/dashboard"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch inventory dashboard:", error);
      throw error;
    }
  },

  /**
   * Get stock list - detailed stock per market
   */
  getStockList: async (params?: {
    market_id?: string;
    product_id?: string;
    warehouse_id?: string;
  }): Promise<StockItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.market_id) queryParams.append("market_id", params.market_id);
      if (params?.product_id) queryParams.append("product_id", params.product_id);
      if (params?.warehouse_id) queryParams.append("warehouse_id", params.warehouse_id);

      const url = `/product/stock/list${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get<{ data: StockItem[] }>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stock list:", error);
      throw error;
    }
  },

  /**
   * Receive stock from supplier - adds stock to gudang/warehouse
   */
  receiveStock: async (payload: ReceiveStockPayload): Promise<{
    purchaseId: string;
    acceptedStockId: string;
  }> => {
    try {
      let data: ReceiveStockPayload | FormData = payload;
      if (payload.proof) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (key === 'proof') {
            formData.append('proof', value);
          } else if (value !== undefined) {
            formData.append(key, String(value));
          }
        });
        data = formData;
      }

      const response = await api.post<{
        message: string;
        data: {
          purchaseId: string;
          acceptedStockId: string;
        };
      }>("/product/inventory/receive", data);

      return {
        purchaseId: response.data?.purchaseId,
        acceptedStockId: response.data?.acceptedStockId,
      };
    } catch (error) {
      console.error("Failed to receive stock:", error);
      throw error;
    }
  },

  /**
   * Receive bulk stock from supplier
   */
  receiveBulkStock: async (payload: ReceiveBulkStockPayload): Promise<{
    purchaseIds: string[];
    acceptedStockIds: string[];
  }> => {
    try {
      let data: ReceiveBulkStockPayload | FormData = payload;
      if (payload.proof) {
        const formData = new FormData();
        formData.append('supplier_id', payload.supplier_id);
        formData.append('warehouse_id', payload.warehouse_id);
        formData.append('items', JSON.stringify(payload.items));
        formData.append('proof', payload.proof);
        data = formData;
      }

      const response = await api.post<{
        message: string;
        data: {
          purchaseIds: string[];
          acceptedStockIds: string[];
        };
      }>("/product/inventory/receive-bulk", data);

      return {
        purchaseIds: response.data?.purchaseIds,
        acceptedStockIds: response.data?.acceptedStockIds,
      };
    } catch (error) {
      console.error("Failed to receive bulk stock:", error);
      throw error;
    }
  },

  /**
   * Transfer stock from gudang to outlet/market
   */
  transferStock: async (payload: TransferStockPayload): Promise<{
    sourceStockId: string;
    targetStockId: string;
  }> => {
    try {
      const response = await api.post<{
        message: string;
        data: {
          sourceStockId: string;
          targetStockId: string;
        };
      }>("/product/inventory/transfer", payload);

      return {
        sourceStockId: response.data?.sourceStockId,
        targetStockId: response.data?.targetStockId,
      };
    } catch (error) {
      console.error("Failed to transfer stock:", error);
      throw error;
    }
  },

  /**
   * Get stock by ID
   */
  getStockById: async (stockId: string): Promise<StockItem> => {
    try {
      const response = await api.get<{ data: StockItem }>(`/product/stock/byid/${stockId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stock by ID:", error);
      throw error;
    }
  },

  /**
   * Get purchase history
   */
  getPurchaseList: async (params?: {
    supplier_id?: string;
    product_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Purchase[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.supplier_id) queryParams.append("supplier_id", params.supplier_id);
      if (params?.product_id) queryParams.append("product_id", params.product_id);
      if (params?.start_date) queryParams.append("start_date", params.start_date);
      if (params?.end_date) queryParams.append("end_date", params.end_date);

      const url = `/transaction/purchase/list${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get<Purchase[]>(url);
      return response;
    } catch (error) {
      console.error("Failed to fetch purchase list:", error);
      throw error;
    }
  },
  /**
   * Request a reject (SPVR)
   */
  requestReject: async (data: FormData): Promise<{ message: string; data?: any }> => {
    try {
      const response = await api.post<any>("/product/inventory/reject-request", data);
      return response;
    } catch (error) {
      console.error("Failed to request reject:", error);
      throw error;
    }
  },

  /**
   * Get list of reject requests
   */
  getRejectList: async (params?: { market_id?: string }): Promise<RejectRequest[]> => {
    try {
      const q = params?.market_id ? `?market_id=${params.market_id}` : '';
      const response = await api.get<{ data: RejectRequest[] }>(`/product/inventory/reject-list${q}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch reject list:", error);
      throw error;
    }
  },

  /**
   * Approve or reject a reject request (Admin/Manager)
   */
  approveReject: async (id: string, action: 'APPROVED' | 'REJECTED'): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>(`/product/inventory/reject-approve/${id}`, { action });
      return response;
    } catch (error) {
      console.error("Failed to approve reject:", error);
      throw error;
    }
  },
  getIntakeHistory: async (warehouseId?: string): Promise<Purchase[]> => {
    try {
      const q = warehouseId ? `?warehouse_id=${warehouseId}` : "";
      const response = await api.get<{ data: Purchase[] }>(`/product/inventory/purchase-history${q}`);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch intake history:", error);
      throw error;
    }
  },

  /**
   * Get list of stock opname sessions
   */
  getStockOpnameList: async (): Promise<any[]> => {
    try {
      const response = await api.get<{ data: any[] }>("/product/stock-opname/list");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stock opname list:", error);
      throw error;
    }
  },

  /**
   * Get list of stock transfers
   */
  getTransferList: async (params?: { status?: string }): Promise<StockTransfer[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      const url = `/product/inventory/transfer-orders${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get<{ data: StockTransfer[] }>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch transfer list:", error);
      throw error;
    }
  },

  /**
   * Accept/verify a stock transfer (SPVR confirms receipt)
   */
  acceptTransfer: async (
    transferId: string,
    acceptedQty: number,
    rejectedQty: number,
    rejectReason?: string,
  ): Promise<any> => {
    try {
      const notes = [
        rejectedQty > 0 ? `Reject: ${rejectedQty}` : null,
        rejectReason?.trim() ? `Alasan: ${rejectReason.trim()}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const response = await api.patch<any>(
        `/product/inventory/transfer-order/${transferId}/status`,
        {
          status: "DONE",
          verified_qty: acceptedQty,
          verified_notes: notes || undefined,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to accept transfer:", error);
      throw error;
    }
  },

  /**
   * Create a new stock opname session
   */
  createOpnameSession: async (marketId: string, batch?: string): Promise<any> => {
    try {
      const response = await api.post<any>("/product/stock-opname/create", {
        market_id: marketId,
        batch,
        status: '1' // 1 = Draft/Overview
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create opname session:", error);
      throw error;
    }
  },

  /**
   * Add detail item to opname session
   */
  addOpnameDetail: async (payload: {
    stock_opname_id: string;
    product_id: string;
    current_stock: number;
    actual_stock: number;
    missing_stock: number;
    adjustment_type: string;
    barcode?: string;
  }): Promise<any> => {
    try {
      const response = await api.post<any>("/product/so-detail/create", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to add opname detail:", error);
      throw error;
    }
  },

  /**
   * Approve and synchronize stock opname
   */
  approveOpname: async (opnameId: string): Promise<any> => {
    try {
      const response = await api.post<any>(`/product/inventory/stock-opname/approve/${opnameId}`);
      return response;
    } catch (error) {
      console.error("Failed to approve opname:", error);
      throw error;
    }
  },

  /**
   * Update stock quantity manually (Manajemen Stok)
   */
  updateStock: async (stockId: string, qty: number): Promise<any> => {
    try {
      const response = await api.patch<any>(`/product/stock/update/${stockId}`, { qty });
      return response;
    } catch (error) {
      console.error("Failed to update stock quantity:", error);
      throw error;
    }
  },

  /**
   * Delete stock record (Manajemen Stok)
   */
  deleteStock: async (stockId: string): Promise<any> => {
    try {
      const response = await api.delete<any>(`/product/stock/delete/${stockId}`);
      return response;
    } catch (error) {
      console.error("Failed to delete stock:", error);
      throw error;
    }
  },
};


// ==========================================
// STOCK TRANSFER ORDER (3-STATUS FLOW)
// ==========================================

export interface CreateTransferOrderPayload {
  source_stock_id: string;
  target_market_id: string;
  product_id: string;
  qty: number;
  unit: string;
  notes?: string;
}

export interface BulkTransferItem {
  source_stock_id: string;
  product_id: string;
  qty: number;
  unit: string;
  target_market_id: string;
}

export interface BulkCreateTransferOrderPayload {
  items: BulkTransferItem[];
  notes?: string;
}

export const TransferOrderService = {
  /** Buat transfer order baru. Stok gudang dikurangi saat SENDING. */
  create: async (payload: CreateTransferOrderPayload): Promise<{ transferId: string; status: string }> => {
    const response = await api.post<{ message: string; data: { transferId: string; status: string } }>(
      '/product/inventory/transfer-order/create',
      payload
    );
    return response.data;
  },

  /** Buat multiple transfer order dalam satu request. */
  bulkCreate: async (payload: BulkCreateTransferOrderPayload): Promise<{ transferIds: string[]; count: number; status: string; transfer_group: string }> => {
    const response = await api.post<{ message: string; data: { transferIds: string[]; count: number; status: string; transfer_group: string } }>(
      '/product/inventory/transfer-order/bulk-create',
      payload
    );
    return response.data;
  },

  /** Konfirmasi pengiriman untuk semua item dalam satu batch. */
  bulkConfirmSend: async (transferIds: string[]): Promise<{ confirmed: number }> => {
    let confirmed = 0;
    for (const id of transferIds) {
      try {
        await TransferOrderService.updateStatus(id, 'WAITING_VERIFICATION');
        confirmed++;
      } catch (e) {
        console.error(`Gagal konfirmasi transfer ${id}:`, e);
      }
    }
    return { confirmed };
  },

  /** List transfer orders (difilter otomatis by role di backend, or manual market_id for admin). */
  list: async (params?: { status?: string; source_market_id?: string }): Promise<StockTransfer[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.source_market_id) queryParams.append("source_market_id", params.source_market_id);
    
    const q = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get<{ data: StockTransfer[] }>(`/product/inventory/transfer-orders${q}`);
    return response.data || [];
  },

  /** Update status: SENDING→WAITING_VERIFICATION atau WAITING_VERIFICATION→DONE */
  updateStatus: async (
    id: string,
    status: 'WAITING_VERIFICATION' | 'DONE',
    verifiedQty?: number,
    verifiedNotes?: string
  ): Promise<StockTransfer> => {
    const response = await api.patch<{ message: string; data: StockTransfer }>(
      `/product/inventory/transfer-order/${id}/status`,
      { status, verified_qty: verifiedQty, verified_notes: verifiedNotes }
    );
    return response.data;
  },

  /** Batalkan transfer (hanya SENDING). Stok gudang dikembalikan. */
  cancel: async (id: string): Promise<{ id: string; status: string }> => {
    const response = await api.post<{ message: string; data: { id: string; status: string } }>(
      `/product/inventory/transfer-order/${id}/cancel`,
      {}
    );
    return response.data;
  },

  /** Upload bukti foto penerimaan transfer */
  uploadTransferProof: async (transferId: string, file: File): Promise<{ image_proof: string }> => {
    const formData = new FormData();
    formData.append('proof', file);
    const response = await api.post<{ message: string; data: { image_proof: string } }>(
      `/product/inventory/transfer-order/${transferId}/proof`,
      formData,
    );
    return response.data;
  },

  /** Detail lengkap untuk cetak laporan. */
  getReport: async (id: string): Promise<StockTransfer> => {
    const response = await api.get<{ data: StockTransfer }>(
      `/product/inventory/transfer-order/${id}/report`
    );
    return response.data;
  },
};
