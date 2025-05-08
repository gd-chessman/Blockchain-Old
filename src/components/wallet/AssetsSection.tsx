import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lang";

interface Token {
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_logo_url?: string;
  token_balance: number;
  token_price_usd: number;
  token_price_sol: number;
  token_balance_usd: number;
  is_verified?: boolean;
}

interface AssetsSectionProps {
  tokens?: Token[];
  onTokenClick?: (token: Token) => void;
  onCopyAddress?: (address: string) => void;
  formatBalance?: (balance: number) => string;
}

export default function AssetsSection({
  tokens = [],
  onTokenClick,
  onCopyAddress,
  formatBalance = (balance) => balance.toFixed(4),
}: AssetsSectionProps) {
  const router = useRouter();
  const { t } = useLang();

  const handleTokenClick = (token: Token) => {
    if (onTokenClick) {
      onTokenClick(token);
    } else {
      router.push(`/trading/token?address=${token.token_address}`);
    }
  };

  const handleCopy = (address: string) => {
    if (onCopyAddress) {
      onCopyAddress(address);
    } else {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border">
      <Card className="border-none shadow-md dark:shadow-blue-900/5">
        <CardContent className="p-0">
          <div className="rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="sticky top-0 z-10 bg-background">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[25%]">
                        {t("wallet.assets.token")}
                      </TableHead>
                      <TableHead className="w-[20%]">
                        {t("wallet.assets.balance")}
                      </TableHead>
                      <TableHead className="w-[20%]">
                        {t("wallet.assets.price")}
                      </TableHead>
                      <TableHead className="w-[20%]">
                        {t("wallet.assets.value")}
                      </TableHead>
                      <TableHead className="w-[15%]">
                        {t("wallet.assets.address")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <Table>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow
                        key={token.token_address}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleTokenClick(token)}
                      >
                        <TableCell className="w-[25%]">
                          <div className="flex items-center">
                            {token.token_logo_url ? (
                              <img
                                src={token.token_logo_url}
                                alt={token.token_symbol}
                                className="size-8 mr-2 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  {token.token_symbol[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {token.token_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {token.token_symbol}
                              </div>
                            </div>
                            {token.is_verified && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                              >
                                ✓
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[20%]">
                          <div className="font-medium">
                            {formatBalance(token.token_balance)}{" "}
                            {token.token_symbol}
                          </div>
                        </TableCell>
                        <TableCell className="w-[20%]">
                          <div className="font-medium">
                            ${formatBalance(token.token_price_usd)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatBalance(token.token_price_sol)} SOL
                          </div>
                        </TableCell>
                        <TableCell className="w-[20%]">
                          <div className="font-medium">
                            ${formatBalance(token.token_balance_usd)}
                          </div>
                        </TableCell>
                        <TableCell className="w-[15%]">
                          <div className="flex items-center">
                            <span className="truncate w-32">
                              {token.token_address.slice(0, 6)}...
                              {token.token_address.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(token.token_address);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
