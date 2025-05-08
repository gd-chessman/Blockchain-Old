"use client"; 

import React, { useState, Suspense } from "react";
import HistoryTransactions from "@/components/trading/history/HistoryTransactions";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderHistoriesByOwner } from "@/services/api/OnChainService";
import { useLang } from "@/lang/useLang";
import { truncateString } from "@/utils/format";
import { Copy } from "lucide-react";
import { ToastNotification } from "@/ui/toast";

function HistoryContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const address = searchParams?.get("address");
  const byOwner = searchParams?.get("by");
  const [showToast, setShowToast] = useState(false);

  const handleCopy = () => {
    if (byOwner) {
      navigator.clipboard.writeText(byOwner);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const { data: orderHistoriesByOwner, isLoading: isLoadingOrderHistoriesByOwner } = useQuery<any[]>({
    queryKey: ["orderHistories", address, byOwner],
    queryFn: () =>
      getOrderHistoriesByOwner({
        address: address || "",
        offset: 0,
        limit: 100,
        sort_by: "block_unix_time",
        sort_type: "desc",
        tx_type: "swap",
        owner: byOwner,
      }),
    enabled: !!address && !!byOwner,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("trading.historyTransactions")}</h1>
        <div className="flex items-center gap-2">
          <p>{truncateString(byOwner, 12)}</p>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-blue-400 rounded-full transition-colors"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
      <HistoryTransactions orders={orderHistoriesByOwner} />
      {showToast && (
        <ToastNotification 
          message={t("createCoin.copySuccess")} 
          duration={3000}
        />
      )}
    </div>
  );
}

export default function History() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}