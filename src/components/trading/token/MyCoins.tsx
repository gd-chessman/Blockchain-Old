import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import Link from "next/link";
import { useLang } from "@/lang";
import { Button } from "@/ui/button";
import { Coins } from "lucide-react";

interface MyCoinsProps {
  coins: Array<{
    name: string;
    symbol: string;
    address: string;
    logo_url: string;
    is_verified: boolean;
  }>;
  className?: string;
}

export default function MyCoins({ coins, className = "" }: MyCoinsProps) {
  const { t } = useLang();

  return (
    <Card className={`shadow-md dark:shadow-blue-900/5 border ${className}`}>
      <CardHeader>
        <CardTitle>{t("trading.myCoins")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {coins.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-muted-foreground mb-4">{t("trading.noCoins")}</p>
              <Button asChild className="bg-gradient-to-r bg-[#d8e8f7] text-black">         
                <Link href="/create-new-coin"> <Coins className="h-5 w-5" />{t("trading.createNewCoin")}</Link>
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 max-h-[30rem] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="space-y-4">
                {coins.map((token, index) => (
                  <Link
                    key={index}
                    className={`flex text-sm gap-6 cursor-pointer ${
                      index < coins.length - 1 ? "border-b-2 pb-2" : ""
                    }`}
                    href={`/trading/token?address=${token.address}`}
                  >
                    <img
                      src={token.logo_url || "/placeholder.png"}
                      alt=""
                      className="size-10 rounded-full"
                    />
                    <div>
                      <p>{token.name}</p>{" "}
                      <p className="text-muted-foreground text-xs">
                        {token.symbol}
                      </p>{" "}
                    </div>
                    <small className="text-green-600 text-xl ml-auto block">
                      {token.is_verified ? " ✓" : "x"}
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
