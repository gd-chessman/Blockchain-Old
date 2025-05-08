import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Copy } from "lucide-react";
import { useLang } from "@/lang";
import { truncateString } from "@/utils/format";

interface TokenInformationProps {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  isVerified: boolean;
  onCopyAddress: () => void;
}

export default function TokenInformation({
  name,
  symbol,
  address,
  decimals,
  isVerified,
  onCopyAddress,
}: TokenInformationProps) {
  const { t } = useLang();

  return (
    <Card className="shadow-md dark:shadow-blue-900/5 border">
      <CardHeader>
        <CardTitle>{t("trading.tokenInformation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 border rounded-md bg-white/50 dark:bg-gray-900/50">
            <div className="flex justify-between mb-6">
              <span className={`text-sm font-medium text-green-500`}>
                {t("trading.attributes")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-blue-500 hover:text-blue-700"
              >
                {t("trading.value")}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <span className="text-muted-foreground">
                {t("trading.name")}:
              </span>
              <span className="text-right">{name}</span>
              <span className="text-muted-foreground">
                {t("trading.symbol")}:
              </span>
              <span className="text-right">{symbol}</span>
              <span className="text-muted-foreground">
                {t("trading.address")}:
              </span>
              <div className="flex items-center justify-end">
                <span className="text-right truncate">{truncateString(address, 10)}</span>
                <button
                  onClick={onCopyAddress}
                  className="ml-2 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  title={t("trading.copyAddress")}
                >
                  <Copy className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                </button>
              </div>
              <span className="text-muted-foreground">
                {t("trading.decimals")}:
              </span>
              <span className="text-right">{decimals}</span>
              <span className="text-muted-foreground">
                {t("trading.verified")}:
              </span>
              <span className={`text-right ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {isVerified ? "✓" : "x"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
