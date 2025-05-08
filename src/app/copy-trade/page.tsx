"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Avatar } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { TrendingUp, Users, Star, CheckCircle2, XCircle } from "lucide-react";
import { useLang } from "@/lang";

export default function CopyTrade() {
  const { t } = useLang();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">{t('copyTrade.title')}</h1>
        <div className="text-sm text-muted-foreground mt-2 md:mt-0">
        </div>
      </div>

      <Tabs defaultValue="success" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="success" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t('copyTrade.success')}
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {t('copyTrade.failed')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="success" className="mt-6">
          <div className="grid gap-4">
            {/* Success trades will be listed here */}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <div className="grid gap-4">
            {/* Failed trades will be listed here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
