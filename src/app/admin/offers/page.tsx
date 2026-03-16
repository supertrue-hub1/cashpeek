"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  Edit,
  Search,
  RefreshCw,
  X,
  CheckSquare,
  Square,
  AlertTriangle,
  Eye,
  FileText,
  Tag,
  Play,
  Archive,
  Rocket,
  Plus,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { OfferEditDialog } from "@/components/admin/offer-edit-dialog"

// Тип оффера для админки
interface AdminOffer {
  id: string
  name: string
  slug: string
  logo?: string
  rating: number
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate?: number
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  affiliateUrl: string
  editorNote?: string
  customDescription?: string
  syncStatus: "synced" | "pending" | "error"
  syncSource?: string
  lastSync: string
  requiresReview: boolean
  reviewReason?: string
  views: number
  clicks: number
  conversions: number
  metaTitle?: string
  metaDescription?: string
  showOnHomepage: boolean
  sortOrder: number
  apiData?: {
    minAmount: number
    maxAmount: number
    minTerm: number
    maxTerm: number
    baseRate: number
    firstLoanRate: number
    decisionTime: number
    approvalRate: number
    payoutMethods: string[]
    features: string[]
    badCreditOk: boolean
    noCalls: boolean
    roundTheClock: boolean
    minAge: number
    documents: string[]
  }
}

// Хук для debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Диалог для bulk действий
function BulkActionDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  onConfirm,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "activate" | "deactivate" | "publish" | "draft" | "archive" | "delete" | null
  selectedCount: number
  onConfirm: () => void
  isLoading: boolean
}) {
  const actionConfig: Record<string, { title: string; description: string; icon: React.ReactNode; variant: "default" | "destructive" }> = {
    activate: {
      title: "Активировать офферы",
      description: `Вы уверены, что хотите отметить как "Рекомендуемые" ${selectedCount} офферов?`,
      icon: <CheckSquare className="h-5 w-5 text-green-500" />,
      variant: "default",
    },
    deactivate: {
      title: "Деактивировать офферы",
      description: `Снять метку "Рекомендуемые" с ${selectedCount} офферов?`,
      icon: <Square className="h-5 w-5 text-muted-foreground" />,
      variant: "default",
    },
    publish: {
      title: "Опубликовать офферы",
      description: `Опубликовать ${selectedCount} офферов на сайте?`,
      icon: <Rocket className="h-5 w-5 text-blue-500" />,
      variant: "default",
    },
    draft: {
      title: "Перевести в черновики",
      description: `Снять с публикации ${selectedCount} офферов?`,
      icon: <FileText className="h-5 w-5 text-yellow-500" />,
      variant: "default",
    },
    archive: {
      title: "Архивировать офферы",
      description: `Переместить в архив ${selectedCount} офферов?`,
      icon: <Archive className="h-5 w-5 text-orange-500" />,
      variant: "default",
    },
    delete: {
      title: "Удалить офферы",
      description: `Вы уверены, что хотите удалить ${selectedCount} офферов? Это действие нельзя отменить.`,
      icon: <X className="h-5 w-5 text-red-500" />,
      variant: "destructive",
    },
  }

  if (!action) return null

  const config = actionConfig[action]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant={config.variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OffersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  
  // Поиск с debounce
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounce(searchInput, 300)
  
  // Фильтры
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [reviewFilter, setReviewFilter] = React.useState<string>("all")
  
  // Данные
  const [offers, setOffers] = React.useState<AdminOffer[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Диалог редактирования
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedOffer, setSelectedOffer] = React.useState<AdminOffer | null>(null)
  
  // Bulk action dialog
  const [bulkAction, setBulkAction] = React.useState<"activate" | "deactivate" | "publish" | "draft" | "archive" | "delete" | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
  const [bulkLoading, setBulkLoading] = React.useState(false)

  // Загрузка данных
  const fetchOffers = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/offers?status=all')
      if (!response.ok) throw new Error('Failed to fetch offers')
      const data = await response.json()
      setOffers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Ошибка загрузки офферов')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  // Фильтрация данных
  const filteredData = React.useMemo(() => {
    return offers.filter((offer) => {
      // Фильтр по поиску
      const matchesSearch = debouncedSearch === "" || 
        offer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        offer.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      // Фильтр по статусу публикации
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "published" && offer.status === "published") ||
        (statusFilter === "draft" && offer.status === "draft") ||
        (statusFilter === "archived" && offer.status === "archived")
      
      // Фильтр по требующим проверки
      const matchesReview = reviewFilter === "all" ||
        (reviewFilter === "needs_review" && offer.requiresReview) ||
        (reviewFilter === "ok" && !offer.requiresReview)
      
      return matchesSearch && matchesStatus && matchesReview
    })
  }, [offers, debouncedSearch, statusFilter, reviewFilter])

  // Получаем выбранные офферы
  const selectedOffers = React.useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id])
    return filteredData.filter(offer => selectedIds.includes(offer.id))
  }, [rowSelection, filteredData])

  // Колонки таблицы
  const columns: ColumnDef<AdminOffer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Выбрать строку"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "logo",
      header: "",
      cell: ({ row }) => {
        const name = row.original.name
        const requiresReview = row.original.requiresReview
        return (
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
              requiresReview 
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-400" 
                : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
            }`}
          >
            {name.substring(0, 2).toUpperCase()}
          </div>
        )
      },
      size: 50,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Название
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const offer = row.original
        return (
          <div className="min-w-[180px]">
            <div className="font-medium flex items-center gap-2">
              {offer.name}
              {offer.requiresReview && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Review
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{offer.slug}</span>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const config: Record<string, { label: string; className: string }> = {
          published: { label: "Published", className: "bg-green-600 hover:bg-green-700" },
          draft: { label: "Draft", className: "bg-yellow-600 hover:bg-yellow-700" },
          archived: { label: "Archived", className: "bg-gray-500 hover:bg-gray-600" },
        }
        const { label, className } = config[status] || config.draft
        return (
          <Badge className={className}>
            {label}
          </Badge>
        )
      },
      size: 100,
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => {
        const isActive = row.original.isFeatured
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : ""}>
            {isActive ? "Yes" : "No"}
          </Badge>
        )
      },
      size: 80,
    },
    {
      accessorKey: "syncSource",
      header: "Source",
      cell: ({ row }) => {
        return (
          <span className="text-sm">{row.original.syncSource || "Manual"}</span>
        )
      },
      size: 90,
    },
    {
      accessorKey: "lastSync",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Last Sync
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastSync"))
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)
        
        let timeAgo: string
        if (diffMins < 60) {
          timeAgo = `${diffMins}m`
        } else if (diffHours < 24) {
          timeAgo = `${diffHours}h`
        } else {
          timeAgo = `${diffDays}d`
        }
        
        return (
          <span className="text-sm text-muted-foreground">{timeAgo} ago</span>
        )
      },
      size: 90,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOffer(row.original)
              setEditDialogOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )
      },
      size: 50,
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Обработчик клика по строке
  const handleRowClick = (offer: AdminOffer) => {
    setSelectedOffer(offer)
    setEditDialogOpen(true)
  }

  // Очистка фильтров
  const clearFilters = () => {
    setSearchInput("")
    setStatusFilter("all")
    setReviewFilter("all")
  }

  const hasActiveFilters = searchInput !== "" || statusFilter !== "all" || reviewFilter !== "all"

  // Bulk action handlers
  const handleBulkAction = (action: typeof bulkAction) => {
    setBulkAction(action)
    setBulkDialogOpen(true)
  }

  const handleBulkConfirm = async () => {
    if (!bulkAction) return
    
    setBulkLoading(true)
    try {
      const ids = selectedOffers.map(o => o.id)
      
      const response = await fetch('/api/offers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction, ids }),
      })
      
      if (!response.ok) throw new Error('Bulk action failed')
      
      const result = await response.json()
      
      const actionLabels: Record<string, string> = {
        activate: "активировано",
        deactivate: "деактивировано",
        publish: "опубликовано",
        draft: "переведено в черновики",
        archive: "архивировано",
        delete: "удалено",
      }
      
      toast.success("Массовое действие выполнено", {
        description: `${result.affected} офферов ${actionLabels[bulkAction]}`,
      })
      
      setRowSelection({})
      setBulkDialogOpen(false)
      fetchOffers() // Refresh data
    } catch (err) {
      toast.error("Ошибка выполнения действия")
    } finally {
      setBulkLoading(false)
    }
  }

  // Обработчик сохранения оффера
  const handleOfferSave = async (data: any) => {
    if (!selectedOffer) return
    
    try {
      const response = await fetch(`/api/offers/${selectedOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      toast.success("Изменения сохранены", {
        description: `Оффер "${data.name}" успешно обновлён`,
      })
      
      setEditDialogOpen(false)
      fetchOffers() // Refresh data
    } catch (err) {
      toast.error("Ошибка сохранения")
    }
  }

  // Показывает требующие проверки офферы
  const offersNeedingReview = offers.filter(o => o.requiresReview).length

  return (
    <div className="space-y-6">
      {/* Предупреждение о требующих проверки */}
      {offersNeedingReview > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-orange-800 dark:text-orange-200">
                Требуют проверки: {offersNeedingReview} офферов
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Обнаружены аномальные изменения при последней синхронизации
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => setReviewFilter("needs_review")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Показать
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Bar */}
      {selectedOffers.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">Выбрано: {selectedOffers.length}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                <Play className="mr-2 h-4 w-4" />
                Активировать
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                Деактивировать
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("publish")}>
                <Rocket className="mr-2 h-4 w-4" />
                Опубликовать
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("draft")}>
                <FileText className="mr-2 h-4 w-4" />
                В черновики
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("archive")}>
                <Archive className="mr-2 h-4 w-4" />
                Архив
              </Button>
            </div>
            <div className="ml-auto">
              <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
                <X className="mr-2 h-4 w-4" />
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Офферы</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Загрузка...' : `${filteredData.length} офферов из ${offers.length}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOffers} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Поиск */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или slug..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchInput("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Фильтры */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reviewFilter} onValueChange={setReviewFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Проверка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="needs_review">⚠️ Требуют review</SelectItem>
                  <SelectItem value="ok">✓ OK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Кнопка очистки */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Сбросить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Ошибка */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Ошибка: {error}</p>
              <Button variant="outline" size="sm" onClick={fetchOffers} className="mt-2">
                Попробовать снова
              </Button>
            </div>
          )}
          
          {/* Загрузка */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Загрузка офферов...</p>
            </div>
          )}
          
          {/* Таблица */}
          {!isLoading && !error && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead 
                              key={header.id}
                              style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => {
                        const requiresReview = row.original.requiresReview
                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className={`cursor-pointer hover:bg-muted/50 ${
                              requiresReview ? "bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30" : ""
                            }`}
                            onClick={() => handleRowClick(row.original)}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell 
                                key={cell.id}
                                onClick={(e) => {
                                  if (cell.column.id === "actions" || cell.column.id === "select") {
                                    e.stopPropagation()
                                  }
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {offers.length === 0 ? 'Нет офферов в базе данных' : 'Офферы не найдены'}
                            </span>
                            {offers.length === 0 && (
                              <Button variant="outline" size="sm" onClick={() => toast.info('Используйте seed-скрипт для добавления офферов')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить офферы
                              </Button>
                            )}
                            {hasActiveFilters && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Сбросить фильтры
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Показано {table.getRowModel().rows.length} из {filteredData.length}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Назад
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Страница {table.getState().pagination.pageIndex + 1} из{" "}
                    {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Вперёд
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <OfferEditDialog
        offer={selectedOffer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleOfferSave}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        action={bulkAction}
        selectedCount={selectedOffers.length}
        onConfirm={handleBulkConfirm}
        isLoading={bulkLoading}
      />
    </div>
  )
}
