import { useLang } from '@/lang/useLang';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import React, { RefObject, useEffect, useState, useRef } from 'react'
import { useWsTokenTransaction } from '@/hooks/useWsTokenTransaction';
import { formatNumberWithSuffix, truncateString } from '@/utils/format';
import { Copy, Filter } from 'lucide-react';
import { ToastNotification } from '@/ui/toast';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/ui/popover";

interface Transaction {
    blockUnixTime: number;
    block_unix_time: number;
    from: {
        address: string;
        ui_amount: number;
        amount: number;
        changeAmount: number;
        decimals: number;
        nearestPrice: number;
        price: number;
        uiAmount: number;
    };
    owner: string;
    side: string;
    source: string;
    to: {
        address: string;
        ui_amount: number;
        amount: number;
        changeAmount: number;
        decimals: number;
        price: number;
        uiAmount: number;
        nearestPrice: number;
    };
    tokenAddress: string;
    txHash: string;
    tx_hash: string;
    volumeUSD: number;
    volume_usd: number;
}

export default function HistoryMyTransactions({ orders = [], historyTransactionsRef, tokenAddress , className, maxHeight = '31.25rem', walletAddress}: { orders?: any[], historyTransactionsRef: any, tokenAddress: any, className?: string, maxHeight?: string, walletAddress: string }) {
    const { t } = useLang();
    const [realTimeOrders, setRealTimeOrders] = useState<Transaction[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
    const { transaction } = useWsTokenTransaction(tokenAddress);
    const router = useRouter();
    const prevTokenAddressRef = useRef<string | null>(null);
    
    // Reset realTimeOrders when tokenAddress changes
    useEffect(() => {
        if (prevTokenAddressRef.current !== tokenAddress) {
            setRealTimeOrders([]);
            prevTokenAddressRef.current = tokenAddress;
        }
    }, [tokenAddress]);

    useEffect(() => {
        if (transaction) {
            setRealTimeOrders(prev => [transaction, ...prev]);
        }
    }, [transaction]);

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

    // Combine real-time orders with existing orders and filter by type
    const allOrders = [...realTimeOrders, ...orders]
        .filter(order => order.side === "buy" || order.side === "sell")
        .filter(order => filterType === 'all' || order.side === filterType)
        .filter(order => order.owner.toLowerCase() === walletAddress.toLowerCase())
        .slice(0, 1000);

    return (
        <Card className={`shadow-md dark:shadow-blue-900/5 border h-full ${className}`}>
            {/* <CardHeader>
                <CardTitle>{t("trading.historyTransactions")}</CardTitle>
            </CardHeader> */}
            <CardContent>
                <div  className={`overflow-x-auto ${maxHeight} min-h-[32.85rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300`}>
                    <table className="w-full">
                        <thead>
                            <tr className="text-sm text-muted-foreground border-b">
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.time")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="flex items-center cursor-pointer">
                                                {t("trading.type")}
                                                <Filter className="ml-1 h-4 w-4 hover:text-blue-500" />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-24 p-1">
                                            <div className="flex flex-col">
                                                <button 
                                                    onClick={() => setFilterType('all')}
                                                    className={`text-xs px-2 py-1 text-left hover:bg-accent rounded-sm ${filterType === 'all' ? 'bg-accent' : ''}`}
                                                >
                                                    {t("trading.all")}
                                                </button>
                                                <button 
                                                    onClick={() => setFilterType('buy')}
                                                    className={`text-xs px-2 py-1 text-left hover:bg-accent rounded-sm ${filterType === 'buy' ? 'bg-accent' : ''}`}
                                                >
                                                    {t("trading.buy")}
                                                </button>
                                                <button 
                                                    onClick={() => setFilterType('sell')}
                                                    className={`text-xs px-2 py-1 text-left hover:bg-accent rounded-sm ${filterType === 'sell' ? 'bg-accent' : ''}`}
                                                >
                                                    {t("trading.sell")}
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.price")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.amount")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.total")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.source")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.txHash")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.status")}</th>
                                <th className="text-left py-3 px-1 whitespace-nowrap text-xs">{t("trading.address")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allOrders.map(
                                (order: Transaction, index: number) => (
                                    <tr key={index} className="text-sm border-b">
                                        <td className="py-3 px-1 text-xs">
                                            {formatTime(order.blockUnixTime || order.block_unix_time)}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
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
                                        <td className="py-3 px-1 text-xs">
                                            ${formatPrice(
                                                order.side === "sell"
                                                    ? (order.from.price || order.from.nearestPrice)
                                                    : order.to?.price || order.to?.nearestPrice
                                            )}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            {formatNumberWithSuffix(
                                                order.side === "sell" 
                                                    ? (order.from.uiAmount || order.from.ui_amount)
                                                    : (order.to?.uiAmount || order.to?.ui_amount)
                                            )}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            ${formatPrice(
                                                order.volumeUSD || (
                                                    order.side === "sell"
                                                        ? (order.from.ui_amount * order.from.price)
                                                        : (order.to?.ui_amount * order.to?.price)
                                                )
                                            )}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            {truncateString(order.source, 20)}
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            {truncateString(order.txHash || order.tx_hash, 10)}
                                        </td>
                                        <td className="py-3 px-1 text-xs uppercase">
                                            <span className="text-blue-600 whitespace-nowrap">
                                                {t("trading.completed")}
                                            </span>
                                        </td>
                                        <td className="py-3 px-1 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span 
                                                    className="cursor-pointer text-yellow-600 dark:text-yellow-200 hover:text-blue-500 underline"
                                                    onClick={() => {
                                                        router.push(`/trading/history?address=${tokenAddress}&by=${order.owner}`);
                                                    }}
                                                >
                                                    {truncateString(order.owner, 8)}
                                                </span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
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
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            {showToast && <ToastNotification message={t("createCoin.copySuccess")} />}
        </Card>
    )
}
