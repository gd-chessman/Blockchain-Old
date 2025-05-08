import { useLang } from "@/lang";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { ToastNotification } from "@/ui/toast";
import { Copy } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function WalletCards({ payloadToken }: { payloadToken: any }) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(t("notifications.addressCopied"));
    setShowToast(true);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      {/* Solana Wallet */}
      <Card className="border-2 border-purple-500 bg-[#bfbfbf] dark:bg-purple-900/10 shadow-md dark:shadow-blue-900/5">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 397.7 311.7"
                fill="currentColor"
                className="text-purple-500"
              >
                <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zM333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">{t("wallet.solanaWallet")}</h2>
          </div>

          <div className="relative mb-4">
            <Input
              value={
                mounted && (payloadToken as any)?.sol_public_key
                  ? `${(payloadToken as any)?.sol_public_key.slice(0, 6)}...${(
                      payloadToken as any
                    )?.sol_public_key.slice(-4)}`
                  : ""
              }
              readOnly
              className="pr-10 bg-gray-50 dark:bg-gray-900/50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                handleCopy((payloadToken as any)?.sol_public_key || "")
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
            {(mounted && (payloadToken as any)?.sol_public_key) || ""}
          </div>
        </CardContent>
      </Card>

      {/* ETH Wallet */}
      <Card className="border-2 border-blue-500 bg-[#bfbfbf] dark:bg-blue-900/10 shadow-md dark:shadow-blue-900/5">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 784.37 1277.39"
                fill="currentColor"
                className="text-blue-500"
              >
                <path d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75Z" />
                <path d="M392.07 0L0 650.54l392.07 231.75V472.33Z" />
                <path d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49Z" />
                <path d="M392.07 1277.38V956.52L0 724.89Z" />
                <path d="M392.07 882.29l392.06-231.75-392.06-178.21Z" />
                <path d="M0 650.54l392.07 231.75V472.33Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">{t("wallet.ethWallet")}</h2>
          </div>

          <div className="relative mb-4">
            <Input
              value={
                mounted && (payloadToken as any)?.eth_public_key
                  ? `${(payloadToken as any)?.eth_public_key.slice(0, 6)}...${(
                      payloadToken as any
                    )?.eth_public_key.slice(-4)}`
                  : ""
              }
              readOnly
              className="pr-10 bg-gray-50 dark:bg-gray-900/50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                handleCopy((payloadToken as any)?.eth_public_key || "")
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
            {(mounted && (payloadToken as any)?.eth_public_key) || ""}
          </div>
        </CardContent>
      </Card>

      {/* BNB Wallet */}
      <Card className="border-2 border-yellow-500 bg-[#bfbfbf] dark:bg-yellow-900/10 shadow-md dark:shadow-blue-900/5">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2500 2500"
                fill="currentColor"
                className="text-yellow-500"
              >
                <path d="M764.48,1050.52,1250,565l485.75,485.73,282.5-282.5L1250,0,482,768l282.49,282.5M0,1250,282.51,967.45,565,1249.94,282.49,1532.45Zm764.48,199.51L1250,1935l485.74-485.72,282.65,282.35-.14.15L1250,2500,482,1732l-.4-.4,282.91-282.12M1935,1250.12l282.51-282.51L2500,1250.1l-282.5,282.51Z" />
                <path d="M1536.52,1249.85h.12L1250,963.19,1038.13,1175h0l-24.34,24.35-50.2,50.21-.4.39.4.41L1250,1536.81l286.66-286.66.14-.16-.26-.14" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">{t("wallet.bnbWallet")}</h2>
          </div>

          <div className="relative mb-4">
            <Input
              value={
                mounted && (payloadToken as any)?.eth_public_key
                  ? `${(payloadToken as any)?.eth_public_key.slice(0, 6)}...${(
                      payloadToken as any
                    )?.eth_public_key.slice(-4)}`
                  : ""
              }
              readOnly
              className="pr-10 bg-gray-50 dark:bg-gray-900/50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                handleCopy((payloadToken as any)?.eth_public_key || "")
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
            {(mounted && (payloadToken as any)?.eth_public_key) || ""}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
