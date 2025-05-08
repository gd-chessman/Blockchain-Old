import { useLang } from '@/lang'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { CardContent } from '@/ui/card'
import { Card } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { cn } from '@/utils/cn'
import React from 'react'

export default function GroupManagement({
  activeGroupTab,
  setActiveGroupTab,
  myGroups,
  filteredGroups,
  selectedGroup,
  handleSelectGroup,
  handleToggleGroup,
  handleDeleteGroup,
  className
}: any) {
    const { t } = useLang();
    
    return (
    <Card className={cn("shadow-md dark:shadow-blue-900/5", className)}>
    <CardContent className="p-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeGroupTab === "on" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveGroupTab("on")}
          className={
            activeGroupTab === "on"
              ? "bg-green-500 hover:bg-green-600"
              : ""
          }
        >
          {t("masterTrade.manage.groupManagement.on")}{" "}
          <Badge
            variant="outline"
            className="ml-1 bg-white text-green-600"
          >
            {myGroups.filter((g: any) => g.mg_status === "on").length}
          </Badge>
        </Button>
        <Button 
          variant={activeGroupTab === "off" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveGroupTab("off")}
          className={
            activeGroupTab === "off"
              ? "bg-orange-500 hover:bg-orange-600"
              : ""
          }
        >
          {t("masterTrade.manage.groupManagement.off")}{" "}
          <Badge variant="outline" className="ml-1">
            {myGroups.filter((g: any) => g.mg_status === "off").length}
          </Badge>
        </Button>
        <Button 
          variant={activeGroupTab === "delete" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveGroupTab("delete")}
          className={
            activeGroupTab === "delete"
              ? "bg-red-500 hover:bg-red-600"
              : ""
          }
        >
          {t("masterTrade.manage.groupManagement.delete")}{" "}
          <Badge variant="outline" className="ml-1">
            {myGroups.filter((g: any) => g.mg_status === "delete").length}
          </Badge>
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border">
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin ">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">
                  {t(
                    "masterTrade.manage.groupManagement.columns.groupName"
                  )}
                </TableHead>
                <TableHead>
                  {t("masterTrade.manage.groupManagement.columns.status")}
                </TableHead>
                <TableHead className="text-right">
                  {t("masterTrade.manage.groupManagement.columns.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group: any) => (
                <TableRow key={group.mg_id} className="hover:bg-muted/30">
                  <TableCell className="font-medium !py-2">
                    <div className="flex items-center space-x-2">
                      {activeGroupTab === "on" && (
                        <Checkbox
                          id={`group-${group.mg_id}`}
                          checked={selectedGroup === group.mg_id}
                          onCheckedChange={(checked) => handleSelectGroup(group.mg_id, checked as boolean)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 border-yellow-500"
                        />
                      )}
                      <label
                        htmlFor={`group-${group.mg_id}`}
                        className="cursor-pointer"
                      >
                        {group.mg_name}
                      </label>
                    </div>
                  </TableCell>
                  <TableCell className="!py-2">
                    <Badge
                      variant="outline"
                      className={
                        group.mg_status === "on"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                      }
                    >
                      {t(`masterTrade.manage.groupManagement.${group.mg_status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right !py-2">
                    {activeGroupTab !== "delete" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            group.mg_status === "delete"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                          }
                          onClick={() =>
                            handleToggleGroup(
                              group.mg_id,
                              group.mg_status === "on" ? "off" : "on"
                            )
                          }
                        >
                          {group.mg_status === "on"
                            ? t("masterTrade.manage.groupManagement.off")
                            : t("masterTrade.manage.groupManagement.on")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                          onClick={() => handleDeleteGroup(group.mg_id)}
                        >
                          {t("masterTrade.manage.groupManagement.delete")}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredGroups.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-4 text-muted-foreground"
                  >
                    {t("masterTrade.manage.groupManagement.noGroups")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}
