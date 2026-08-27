import { MapPin, Warehouse, Store, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Location {
  id: string;
  name: string;
  type?: "GUDANG" | "OUTLET";
}

interface LocationSwitcherProps {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

export function LocationSwitcher({
  locations,
  selectedId,
  onSelect,
  className,
}: LocationSwitcherProps) {
  const gudangs = locations.filter((l) => l.type === "GUDANG");
  const outlets = locations.filter((l) => l.type === "OUTLET");

  const selectedLocation = locations.find((l) => String(l.id) === String(selectedId));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi:</span>
      </div>

      <Select
        value={selectedId || "all"}
        onChange={(val) => onSelect(val === "all" ? null : String(val))}
      >
        <SelectTrigger className="w-[220px] bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all font-semibold text-gray-700 h-9">
          <SelectValue placeholder="Pilih Lokasi" />
        </SelectTrigger>
        <SelectContent align="start" className="w-[280px]">
          <SelectGroup>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Semua Lokasi</span>
              </div>
            </SelectItem>
            
            {gudangs.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 mt-1">
                  Gudang
                </div>
                {gudangs.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{g.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {outlets.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 mt-1">
                  Outlet
                </div>
                {outlets.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>{o.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
