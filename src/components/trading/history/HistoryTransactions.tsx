import { useLang } from '@/lang/useLang';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import React, { RefObject, useState } from 'react'
import { formatNumberWithSuffix, truncateString } from '@/utils/format';
import { Copy } from 'lucide-react';
import { ToastNotification } from '@/ui/toast';
import { Skeleton } from '@/ui/skeleton';

interface Transaction {
    blockUnixTime: number;
    block_unix_time: number;
    from: {
        address: string;
        ui_amount: number;
        changeAmount: number;
        decimals: number;
        amount: number;
        price: number;
        nearestPrice: number;
    };
    owner: string;
    side: string;
    source: string;
    to: {
        address: string;
        ui_amount: number;
        changeAmount: number;
        decimals: number;
        amount: number;
        price: number;
    };
    tokenAddress: string;
    txHash: string;
    tx_hash: string;
    volumeUSD: number;
}

export default function HistoryTransactions({ orders = [], historyTransactionsRef , className}: { orders?: any[], historyTransactionsRef?: any, className?: string }) {
    const { t } = useLang();
    const [showToast, setShowToast] = useState(false);
    
    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatVolume = (volume: number | undefined) => {
        if (volume === undefined) return '0.0';
        return volume?.toFixed(2);
    };

    const formatPrice = (price: number | undefined) => {
        if (price === undefined) return '0.0';
        return price?.toFixed(6);
    };

    // Filter orders to only include buy/sell transactions
    const filteredOrders = orders.filter(order => 
        order.side === "buy" || order.side === "sell"
    );

    return (
        <Card className="shadow-md dark:shadow-blue-900/5 border h-full ">
            <CardContent className="px-0 ">
                <div ref={historyTransactionsRef} className={`overflow-x-auto max-h-[80svh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 rounded-lg ${className} `}>
                    <table className="w-full">
                        <thead >
                            <tr className="text-sm text-muted-foreground border-b sticky top-0 bg-background">
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.time")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.type")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.price")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.amount")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.total")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap">{t("trading.source")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap">{t("trading.txHash")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.status")}</th>
                                <th className="text-left py-3 px-2 whitespace-nowrap">{t("trading.address")}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {orders.length === 0 ? (
                                Array(5).fill(0).map((_, index) => (
                                    <tr key={index} className="text-sm border-b">
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-24" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-16" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-20" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-16" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-20" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-16" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-24" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-24" />
                                        </td>
                                        <td className="py-3 px-2">
                                            <Skeleton className="h-4 w-24" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredOrders.map(
                                    (order: Transaction, index: number) => (
                                        <tr key={index} className="text-sm border-b">
                                            <td className="py-3 px-2">
                                                {formatTime(order.blockUnixTime || order.block_unix_time)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span
                                                    className={
                                                        order.side === "buy"
                                                            ? "text-green-500 uppercase whitespace-nowrap"
                                                            : "text-red-500 uppercase whitespace-nowrap"
                                                    }
                                                >
                                                    {t(`trading.${order.side}`)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                ${formatPrice(order.side === "sell" ? order.from.price || order.from.nearestPrice : order.to.price)}
                                            </td>
                                            <td className="py-3 px-2">
                                                {formatNumberWithSuffix(order.side === "sell" ? order.from.ui_amount : order.to.ui_amount)}
                                            </td>
                                            <td className="py-3 px-2">
                                                ${formatPrice(order.volumeUSD || (order.side === "sell" ? order.from.ui_amount * order.from.price : order.to.ui_amount * order.to.price))}
                                            </td>
                                            <td className="py-3 px-1 text-xs">
                                            {truncateString(order.source, 20)}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            {truncateString(order.txHash || order.tx_hash, 10)}
                                        </td>
                                            <td className="py-3 px-2 uppercase">
                                                <span className="text-blue-600 whitespace-nowrap">
                                                    {t("trading.completed")}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-1">
                                                    {truncateString(order.owner, 8)}
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(order.owner);
                                                            setShowToast(true);
                                                            setTimeout(() => setShowToast(false), 3000);
                                                        }}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            {showToast && <ToastNotification message={t("createCoin.copySuccess")} />}
        </Card>
    )
}

