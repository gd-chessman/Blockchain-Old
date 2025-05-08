import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { useLang } from "@/lang";
import React from "react";
import { Check, Pencil } from "lucide-react";
import { Input } from "@/ui/input";
import Select from "react-select";

export default function PlaceOrder({
  selectedAction,
  handleActionClick,
  balance,
  amount,
  handleAmountChange,
  value,
  handleValueChange,
  handleEditClick,
  handleSave,
  handleSolEditClick,
  handleSolSave,
  groupOptions,
  selectedGroups,
  handleGroupChange,
  handleTrading,
  tokenInfor,
  solPrice,
  tokenAmount,
  marks,
  percentages,
  editingIndex,
  tempValue,
  setTempValue,
  solAmounts,
  editingSolIndex,
  tempSolValue,
  setTempSolValue,
  setAmount,
  setValue,
  className,
}: {
  selectedAction: string;
  handleActionClick: any;
  balance: any;
  amount: any;
  handleAmountChange: any;
  value: any;
  handleValueChange: any;
  handleEditClick: any;
  handleSave: any;
  handleSolEditClick: any;
  handleSolSave: any;
  groupOptions: any;
  selectedGroups: any;
  handleGroupChange: any;
  handleTrading: any;
  tokenInfor: any;
  solPrice: any;
  tokenAmount: any;
  marks: any;
  percentages: any;
  editingIndex: number | null;
  tempValue: string;
  setTempValue: (value: string) => void;
  solAmounts: any;
  editingSolIndex: number | null;
  tempSolValue: string;
  setTempSolValue: (value: string) => void;
  setAmount: (value: any) => void;
  setValue: (value: number) => void;
  className?: string;
}) {
  const { t } = useLang();
  return (
    <Card className={`shadow-md dark:shadow-blue-900/5 border ${className}`}>
      <CardContent className="mt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              className={`${
                selectedAction === "buy"
                  ? "bg-green-100 text-green-600 hover:bg-green-200 border border-green-500 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:border-green-500 dark:hover:shadow-lg dark:hover:shadow-green-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleActionClick("buy")}
            >
              {t("trading.buy")}
            </Button>
            <Button
              className={`${
                selectedAction === "sell"
                  ? "bg-red-100 text-red-600 hover:bg-red-200 border border-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:border-red-500 dark:hover:shadow-lg dark:hover:shadow-red-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleActionClick("sell")}
            >
              {t("trading.sell")}
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                {t("trading.amount")}
              </label>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">
                  Balance: {balance.toFixed(5)}{" "}
                  {selectedAction === "buy" ? "SOL" : tokenInfor?.symbol}
                </span>
              </div>
            </div>
            <div className="flex mt-1">
              <Input
                type="number"
                placeholder="0.00"
                className="rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={amount}
                onChange={handleAmountChange}
                min={0}
                max={tokenAmount?.data?.token_balance}
              />
              <div className="bg-muted px-3 py-2 text-sm rounded-r-md border border-l-0 border-input min-w-28 flex items-center gap-2">
                {selectedAction === "buy" && (
                  <span className="text-xs text-muted-foreground">
                    ${(Number(amount) * (solPrice?.priceUSD || 0)).toFixed(2)}
                  </span>
                )}
                <span>{value.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              {t("trading.percentage")}
            </label>
            <div className="relative mt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={value}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                className="w-full h-2 cursor-pointer accent-blue-500 bg-transparent appearance-none"
                style={{
                  WebkitAppearance: "none",
                  borderRadius: "0.5rem",
                  background: `linear-gradient(to right, #3b82f6 ${value}%, #e5e7eb ${value}%)`,
                }}
              />

              <div className="relative flex justify-between text-xs text-muted-foreground mt-2 px-1">
                {marks.map((mark: any) => (
                  <div
                    key={mark}
                    className="relative flex flex-col items-center w-0"
                  >
                    <span>{mark}</span>
                    <span className="absolute top-[-6px] w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-sm mt-2 font-semibold text-blue-600">
              {value.toFixed(2)}%
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {percentages.map((percent: any, index: any) => (
              <div
                key={index}
                className="relative flex items-center gap-1 border rounded-md hover:bg-muted/50 transition-colors p-0.5"
              >
                {editingIndex === index ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSave(index)}
                      autoFocus
                      type="number"
                      min={0}
                      max={100}
                      className="flex-1 h-7 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleSave(index)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 flex-1 justify-start text-xs md:text-sm px-1"
                      onClick={() => handleValueChange(Number(percent))}
                    >
                      <span className="text-xs">{percent}%</span>
                    </Button>
                    <button
                      onClick={() => handleEditClick(index)}
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {selectedAction === "buy" &&
              solAmounts.map((solAmount: any, index: any) => (
                <div
                  key={index}
                  className="relative flex items-center gap-1 border rounded-md hover:bg-muted/50 transition-colors p-0.5"
                >
                  {editingSolIndex === index ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <Input
                        value={tempSolValue}
                        onChange={(e) => setTempSolValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSolSave(index)
                        }
                        autoFocus
                        type="number"
                        min={0}
                        step="0.1"
                        className="flex-1 h-7 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSolSave(index)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex-1 justify-start text-xs md:text-sm px-1"
                        onClick={() => {
                          if (selectedAction === "buy") {
                            setAmount(solAmount);
                            if (tokenAmount?.data?.sol_balance) {
                              const percentage =
                                (Number(solAmount) /
                                  tokenAmount.data.sol_balance) *
                                100;
                              setValue(Math.min(100, Math.max(0, percentage)));
                            }
                          }
                        }}
                      >
                        <span className="text-xs">
                          {solAmount} <small className="text-[9px]">SOL</small>
                        </span>
                      </Button>
                      <button
                        onClick={() => handleSolEditClick(index)}
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-900/50">
              <h3 className="text-sm font-medium mb-2">
                {t("trading.selectGroups")}
              </h3>
              <Select
                isMulti
                options={groupOptions}
                value={selectedGroups}
                onChange={handleGroupChange}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder={t("trading.selectGroupsPlaceholder")}
                noOptionsMessage={() => t("trading.noGroupsAvailable")}
                menuPlacement="top"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--input))",
                    color: "hsl(var(--foreground))",
                    "&:hover": {
                      borderColor: "hsl(var(--input))",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--input))",
                    borderRadius: "0.375rem",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "hsl(var(--primary))"
                      : state.isFocused
                      ? "hsl(var(--accent))"
                      : "transparent",
                    color: state.isSelected
                      ? document.documentElement.classList.contains("dark")
                        ? "#fff"
                        : "#000"
                      : "hsl(var(--foreground))",
                    "&:hover": {
                      backgroundColor: "hsl(var(--accent))",
                      color: "hsl(var(--foreground))",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "hsl(var(--primary))",
                    color: document.documentElement.classList.contains("dark")
                      ? "#fff"
                      : "#000",
                    borderRadius: "0.375rem",
                    padding: "0.125rem 0.25rem",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark")
                      ? "#fff"
                      : "#000",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    padding: "0.125rem 0.25rem",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark")
                      ? "#fff"
                      : "#000",
                    padding: "0.125rem 0.25rem",
                    ":hover": {
                      backgroundColor: "hsl(var(--destructive))",
                      color: "white",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "hsl(var(--foreground))",
                    fontSize: "0.875rem",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "hsl(var(--foreground))",
                    fontSize: "0.875rem",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "0.875rem",
                  }),
                  menuList: (base) => ({
                    ...base,
                    color: "hsl(var(--foreground))",
                  }),
                  noOptionsMessage: (base) => ({
                    ...base,
                    color: "hsl(var(--muted-foreground))",
                  }),
                }}
              />
            </div>

            <Button
              className={`w-full ${
                selectedAction === "buy"
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:hover:shadow-lg dark:hover:shadow-green-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
                  : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:hover:shadow-lg dark:hover:shadow-red-500/20 dark:hover:-translate-y-0.5 transition-all duration-200"
              }`}
              onClick={handleTrading}
              disabled={!amount || Number(amount) <= 0}
            >
              {selectedAction === "buy"
                ? t("trading.buyNow")
                : t("trading.sellNow")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
