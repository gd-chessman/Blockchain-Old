import IframeChartPage from "@/components/chart/IframeChartPage";
import { useLang } from "@/lang/useLang";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { formatNumberWithSuffix, truncateString } from "@/utils/format";
import React from "react";
import { Copy, Globe } from "lucide-react";
import { SiTelegram } from 'react-icons/si';
import { ToastNotification } from "@/ui/toast";
import { useState } from "react";
import TokenInforDetail from "./ui/TokenInforDetail";
import Klinecharts from "@/components/chart/Klinecharts";

export default function TradingChart({
  tokenInfor,
  address,
  className,
}: {
  tokenInfor: any;
  address: any;
  className?: string;
}) {
  const { t } = useLang();
  const [showToast, setShowToast] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tokenInfor?.address);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      {showToast && (
        <ToastNotification
          message={t("createCoin.copySuccess")}
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
      <Card className={`shadow-md dark:shadow-blue-900/5 border ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <img
                src={tokenInfor?.logoUrl || "/placeholder.png"}
                alt={tokenInfor?.symbol}
                className="size-12 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    {tokenInfor?.symbol}/SOL
                  </CardTitle>
                  <CardDescription>{tokenInfor?.name}</CardDescription>
                  {tokenInfor?.program === "pumpfun" && (
                    <img src="/pump.webp" alt="pump" className="h-6 w-6" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {truncateString(tokenInfor?.address, 10)}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {tokenInfor?.twitter && (
                    <a
                      href={tokenInfor.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <svg
                      width="14"
                      height="14"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 300 300"
                    >
                      <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
                    </svg>
                    </a>
                  )}
                  {tokenInfor?.telegram && (
                    <a
                      href={tokenInfor.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                      <SiTelegram className="h-4 w-4" />
                    </a>
                  )}
                  {tokenInfor?.website && (
                    <a
                      href={tokenInfor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {/* {tokenInfor?.twitter && (
                    <a
                      href={tokenInfor.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )} */}
                </div>
              </div>
            </div>

            <div className="text-right overflow-x-auto">
              <TokenInforDetail />
              <div className="text-2xl font-bold">
                {/* ${tokenPrice?.priceUSD?.toFixed(9) || "0.00"} */}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Klinecharts />
        </CardContent>
      </Card>
    </>
  );
}
