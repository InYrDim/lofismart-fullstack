import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/types";

export interface PaymentStatusDataPoint {
    date: string;
    overview: number;
    unpaid: number;
    paid: number;
    formattedDate: string;
}

export function usePaymentStatusMetrics(data: Transaction[]) {
    return useMemo(() => {
        const groupedData: Record<
            string,
            { overview: number; unpaid: number; paid: number }
        > = {};

        data.forEach((trx) => {
            const date = trx.transaction_date.split("T")[0]; // YYYY-MM-DD
            if (!groupedData[date]) {
                groupedData[date] = { overview: 0, unpaid: 0, paid: 0 };
            }

            if (trx.is_paid === "1") {
                groupedData[date].overview += 1;
            } else if (trx.is_paid === "2") {
                groupedData[date].unpaid += 1;
            } else if (trx.is_paid === "3") {
                groupedData[date].paid += 1;
            }
        });

        return Object.entries(groupedData)
            .map(([date, counts]) => ({
                date,
                ...counts,
                formattedDate: format(parseISO(date), "d MMM", { locale: id }),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);
}
