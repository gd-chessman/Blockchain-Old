import { useLang } from "@/lang/useLang";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Copy } from "lucide-react";
import React from "react";

export default function ConnectedMembers({
  connects,
  memberBalances,
  checkedConnections,
  handleCheckboxChange,
  setShowToast,
  className,
}: {
  connects: any;
  memberBalances: any;
  checkedConnections: any;
  handleCheckboxChange: any;
  setShowToast: any;
  className?: string;
}) {
  const { t } = useLang();
  return (
    <Card className={`shadow-md dark:shadow-blue-900/5 overflow-y-auto ${className}`}>
      <CardHeader>
        <CardTitle>{t("trading.listConnect")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50 max-h-[31rem] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="space-y-4">
              {connects.filter((connect: any) => connect.status === "connect")
                .length > 0 ? (
                connects
                  .filter((connect: any) => connect.status === "connect")
                  .map((connect: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border-b"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {connect.member_address.slice(0, 4)}...
                            {connect.member_address.slice(-4)}
                          </p>
                          {memberBalances[connect.member_address] && (
                            <p className="text-xs text-muted-foreground">
                              {memberBalances[
                                connect.member_address
                              ].sol_balance.toFixed(4)}{" "}
                              SOL ($
                              {memberBalances[
                                connect.member_address
                              ].solana_balance_usd?.toFixed(2)}
                              )
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard
                              .writeText(connect.member_address)
                              .then(() => {
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                              });
                          }}
                          className="ml-2 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                          title="Copy address"
                        >
                          <Copy className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        </button>
                      </div>
                      <Checkbox
                        checked={checkedConnections[connect.connection_id]}
                        onCheckedChange={() =>
                          handleCheckboxChange(
                            connect.connection_id,
                            connect.member_id
                          )
                        }
                        className="border-yellow-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </div>
                  ))
              ) : (
                <div className="text-center text-muted-foreground">
                  {t("trading.noConnections")}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
