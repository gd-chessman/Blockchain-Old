import { useLang } from '@/lang';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import {  Checkbox, } from '@/ui/checkbox';
import { Table, TableCell, TableBody, TableHeader, TableRow, TableHead } from '@/ui/table';
import { TabsContent } from '@/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs';
import { cn } from '@/utils/cn';
import { Copy } from 'lucide-react';
import React from 'react'

type Connection = {
    connection_id: number;
    member_id: number;
    member_address: string;
    status: "connect" | "pending" | "pause" | "block";
    option_limit: string;
    price_limit: string;
    ratio_limit: number;
    joined_groups: {
      group_id: number;
      group_name: string;
    }[];
  };

type ConnectionManagementProps = {
  myConnects: any[];
  selectedGroup: any;
  filteredConnections: any[];
  selectedConnections: any[];
  setActiveTab: (value: string) => void;
  handleOpenJoinDialog: () => void;
  handleSelectAllConnections: (checked: boolean) => void;
  handleSelectConnection: (id: string, checked: boolean) => void;
  handleToggleConnection: (id: number, action: string) => void;
  handleBlockConnection: (id: number, block: boolean) => void;
  handleCopyAddress: (address: string) => void;
  className?: string;
};

export default function ConnectionManagement({
  myConnects,
  selectedGroup,
  filteredConnections,
  selectedConnections,
  setActiveTab,
  handleOpenJoinDialog,
  handleSelectAllConnections,
  handleSelectConnection,
  handleToggleConnection,
  handleBlockConnection,
  handleCopyAddress,
  className,
}: ConnectionManagementProps) {
  const { t } = useLang();
  return (
    <Card className={cn("shadow-md dark:shadow-blue-900/5", className)}>
    <CardContent className="p-6">
      <Tabs defaultValue="connected" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="overflow-x-auto md:overflow-x-visible whitespace-nowrap max-w-full">
            <TabsTrigger value="pending">
              {t("masterTrade.manage.connectionManagement.tabs.pending")}{" "}
              <Badge variant="outline" className="ml-1 text-black">
                {myConnects.filter((c) => c.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="connected">
              {t(
                "masterTrade.manage.connectionManagement.tabs.connected"
              )}{" "}
              <Badge variant="outline" className="ml-1 text-black">
                {
                  myConnects.filter((c) => c.status === "connect")
                    .length
                }
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="paused">
              {t("masterTrade.manage.connectionManagement.tabs.paused")}{" "}
              <Badge variant="outline" className="ml-1 text-black">
                {myConnects.filter((c) => c.status === "pause").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="blocked">
              {t("masterTrade.manage.connectionManagement.tabs.blocked")}{" "}
              <Badge variant="outline" className="ml-1 text-black">
                {myConnects.filter((c) => c.status === "block").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          {selectedGroup && (
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={handleOpenJoinDialog}
            >
              {t("masterTrade.manage.connectionManagement.join")}
            </Button>
          )}
        </div>

        <TabsContent value="pending" className="mt-0">
          <ConnectionsTable
            connections={filteredConnections}
            selectedConnections={selectedConnections}
            onSelectAll={handleSelectAllConnections}
            onSelectConnection={handleSelectConnection}
            onToggleConnection={handleToggleConnection}
            onBlockConnection={handleBlockConnection}
            onCopyAddress={handleCopyAddress}
          />
        </TabsContent>

        <TabsContent value="connected" className="mt-0">
          <ConnectionsTable
            connections={filteredConnections}
            selectedConnections={selectedConnections}
            onSelectAll={handleSelectAllConnections}
            onSelectConnection={handleSelectConnection}
            onToggleConnection={handleToggleConnection}
            onBlockConnection={handleBlockConnection}
            onCopyAddress={handleCopyAddress}
          />
        </TabsContent>

        <TabsContent value="paused" className="mt-0">
          <ConnectionsTable
            connections={filteredConnections}
            selectedConnections={selectedConnections}
            onSelectAll={handleSelectAllConnections}
            onSelectConnection={handleSelectConnection}
            onToggleConnection={handleToggleConnection}
            onBlockConnection={handleBlockConnection}
            onCopyAddress={handleCopyAddress}
          />
        </TabsContent>

        <TabsContent value="blocked" className="mt-0">
          <ConnectionsTable
            connections={filteredConnections}
            selectedConnections={selectedConnections}
            onSelectAll={handleSelectAllConnections}
            onSelectConnection={handleSelectConnection}
            onToggleConnection={handleToggleConnection}
            onBlockConnection={handleBlockConnection}
            onCopyAddress={handleCopyAddress}
          />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
  )
}


function ConnectionsTable({
    connections,
    selectedConnections,
    onSelectAll,
    onSelectConnection,
    onToggleConnection,
    onBlockConnection,
    onCopyAddress,
  }: {
    connections: Connection[];
    selectedConnections: string[];
    onSelectAll: (checked: boolean) => void;
    onSelectConnection: (id: string, checked: boolean) => void;
    onToggleConnection: (id: number, action: string) => void;
    onBlockConnection: (id: number, block: boolean) => void;
    onCopyAddress: (address: string) => void;
  }) {
    const { t } = useLang();
    const isConnectedTab = connections.some(conn => conn.status === "connect");
  
    return (
      <div className="rounded-lg overflow-hidden border">
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900 dark:hover:scrollbar-thumb-gray-600">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow className="bg-muted/50">
                {isConnectedTab && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        connections.length > 0 &&
                        selectedConnections.length === connections.length
                      }
                      onCheckedChange={onSelectAll}
                      aria-label="Select all"
                      className="data-[state=unchecked]:border-yellow-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[250px]">
                  {t(
                    "masterTrade.manage.connectionManagement.columns.walletAddress"
                  )}
                </TableHead>
                <TableHead>
                  {t(
                    "masterTrade.manage.connectionManagement.columns.joinedGroups"
                  )}
                </TableHead>
                <TableHead>
                  {t("masterTrade.manage.connectionManagement.columns.status")}
                </TableHead>
                <TableHead className="text-right">
                  {t("masterTrade.manage.connectionManagement.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.connection_id} className="hover:bg-muted/30">
                  {isConnectedTab && (
                    <TableCell>
                      <Checkbox
                        checked={selectedConnections.includes(
                          connection.connection_id.toString()
                        )}
                        onCheckedChange={(checked) =>
                          onSelectConnection(
                            connection.connection_id.toString(),
                            checked as boolean
                          )
                        }
                        aria-label={`Select connection ${connection.connection_id}`}
                        className="data-[state=unchecked]:border-yellow-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center">
                      <span>{connection.member_address.slice(0, 6)}...{connection.member_address.slice(-4)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => onCopyAddress(connection.member_address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {connection.joined_groups.map((group: any) => (
                        <Badge
                          key={group.group_id}
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        >
                          {group.group_name}
                        </Badge>
                      ))}
                      {connection.joined_groups.length === 0 && (
                        <span className="text-muted-foreground text-sm">
                          {t("masterTrade.manage.connectionManagement.noGroups")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        connection.status === "connect"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                          : connection.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                          : connection.status === "pause"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                      }
                    >
                      {connection.status === "block" 
                        ? t("masterTrade.manage.connectionManagement.actions.block")
                        : connection.status === "pause"
                        ? t("masterTrade.manage.connectionManagement.actions.pause")
                        : connection.status === "connect"
                        ? t("masterTrade.manage.connectionManagement.actions.connect")
                        : connection.status === "pending"
                        ? t("masterTrade.manage.connectionManagement.actions.pending")
                        : connection.status
                        }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {connection.status === "connect" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onBlockConnection(connection.connection_id, true)}
                      >
                        {t("masterTrade.manage.connectionManagement.actions.block")}
                      </Button>
                    ) : connection.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/30"
                          onClick={() =>
                            onToggleConnection(connection.connection_id, "connect")
                          }
                        >
                          {t("masterTrade.manage.connectionManagement.actions.connect")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => onBlockConnection(connection.connection_id, true)}
                        >
                          {t("masterTrade.manage.connectionManagement.actions.block")}
                        </Button>
                      </div>
                    ) : connection.status === "block" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onBlockConnection(connection.connection_id, false)}
                      >
                        {t("masterTrade.manage.connectionManagement.actions.unblock")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onBlockConnection(connection.connection_id, true)}
                      >
                        {t("masterTrade.manage.connectionManagement.actions.block")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {connections.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-muted-foreground"
                  >
                    {t("masterTrade.manage.connectionManagement.noConnections")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* {connections.length > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled={true}>
              {t("masterTrade.manage.connectionManagement.previous")}
            </Button>
            <Button variant="outline" size="sm" disabled={false}>
              {t("masterTrade.manage.connectionManagement.next")}
            </Button>
          </div>
        )} */}
      </div>
    );
  }