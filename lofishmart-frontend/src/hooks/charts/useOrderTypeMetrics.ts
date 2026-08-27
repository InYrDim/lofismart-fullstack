import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/types";

export interface OrderTypeDataPoint {
    typeValue: number;
    typeLabel: string;
    formattedDate: string;
    timestamp: number;
    [key: string]: any;
}

export function useOrderTypeMetrics(data: Transaction[]) {
    return useMemo(() => {
        return data
            .map((trx) => {
                let typeValue = 0;
                let typeLabel = "";

                if (trx.online_order === "1") {
                    typeValue = 1;
                    typeLabel = "Offline";
                } else if (trx.online_order === "2") {
                    typeValue = 2;
                    typeLabel = "Online";
                } else {
                    typeValue = 3;
                    typeLabel = "Lainnya";
                }

                return {
                    ...trx,
                    typeValue,
                    typeLabel,
                    formattedDate: format(parseISO(trx.transaction_date), "d MMM HH:mm", {
                        locale: id,
                    }),
                    timestamp: new Date(trx.transaction_date).getTime(),
                };
            })
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [data]);
}
