import { useState } from "react"

import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { jsPDF } from "jspdf"
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx"
import * as XLSX from "xlsx"

import { getCategories, type Category } from "../../api/categories"
import { getOrders } from "../../api/orders"
import { getProducts } from "../../api/products"
import { getUsers, type AdminUser } from "../../api/auth"
import type { ProductListResponse } from "../../types/product"
import type { Order } from "../../types/order"

type ReportType = "sales" | "customers" | "inventory"
type ExportFormat = "pdf" | "docx" | "xlsx"
type TemplatePreset = "emerald" | "amber" | "rose"
type RoleFilter = "all" | "admin" | "user"

type SummaryItem = {
  label: string
  value: string
}

type ReportRow = Record<string, string | number>

type ReportModel = {
  title: string
  subtitle: string
  summary: SummaryItem[]
  rows: ReportRow[]
  columns: string[]
}

const PDF_FONT_NAME = "DejaVuSans"
const PDF_FONT_URL = "/fonts/DejaVuSans.ttf"
const PDF_FONT_BOLD_URL = "/fonts/DejaVuSans-Bold.ttf"

let pdfFontDataPromise:
  | Promise<{ regularBinary: string; boldBinary: string }>
  | null = null

const reportLabels: Record<ReportType, { title: string; subtitle: string }> = {
  sales: {
    title: "Отчет по продажам",
    subtitle: "Сводка по выручке и самым продаваемым товарам",
  },
  customers: {
    title: "Отчет по клиентам",
    subtitle: "Активность клиентов и распределение заказов по пользователям",
  },
  inventory: {
    title: "Складской отчет",
    subtitle: "Остатки товаров, категории и низкие запасы",
  },
}

const templatePresets: Record<
  TemplatePreset,
  { label: string; accent: string; surface: string }
> = {
  emerald: {
    label: "Emerald Glass",
    accent: "#10b981",
    surface: "rgba(16,185,129,0.16)",
  },
  amber: {
    label: "Amber Warm",
    accent: "#f59e0b",
    surface: "rgba(245,158,11,0.16)",
  },
  rose: {
    label: "Rose Contrast",
    accent: "#fb7185",
    surface: "rgba(251,113,133,0.16)",
  },
}

const reportTypeOptions = [
  {
    value: "sales" as const,
    label: "Продажи",
    description: "Выручка, топ товаров, статусы заказов",
  },
  {
    value: "customers" as const,
    label: "Клиенты",
    description: "Заказы по пользователям и активные клиенты",
  },
  {
    value: "inventory" as const,
    label: "Склад",
    description: "Остатки, категории и критические позиции",
  },
]

const exportFormatOptions: Array<{
  value: ExportFormat
  label: string
}> = [
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "DOCX" },
    { value: "xlsx", label: "XLSX" },
  ]

const defaultInputs: Record<ReportType, { title: string; subtitle: string }> = {
  sales: {
    title: reportLabels.sales.title,
    subtitle: reportLabels.sales.subtitle,
  },
  customers: {
    title: reportLabels.customers.title,
    subtitle: reportLabels.customers.subtitle,
  },
  inventory: {
    title: reportLabels.inventory.title,
    subtitle: reportLabels.inventory.subtitle,
  },
}

const roleLabels: Record<number, string> = {
  1: "Admin",
}

const formatCurrency = (value: number) =>
  `${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 2,
  })} ₽`

const formatNumber = (value: number) =>
  value.toLocaleString("ru-RU", {
    maximumFractionDigits: 2,
  })

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ""

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return binary
}

const loadPdfFontData = () => {
  if (pdfFontDataPromise) {
    return pdfFontDataPromise
  }

  pdfFontDataPromise = (async () => {
    const [regularResponse, boldResponse] = await Promise.all([
      fetch(PDF_FONT_URL),
      fetch(PDF_FONT_BOLD_URL),
    ])

    if (!regularResponse.ok || !boldResponse.ok) {
      throw new Error("Failed to load PDF font")
    }

    const [regularBuffer, boldBuffer] = await Promise.all([
      regularResponse.arrayBuffer(),
      boldResponse.arrayBuffer(),
    ])

    return {
      regularBinary: arrayBufferToBinaryString(regularBuffer),
      boldBinary: arrayBufferToBinaryString(boldBuffer),
    }
  })()

  return pdfFontDataPromise
}

const registerPdfFont = async (pdf: jsPDF) => {
  const { regularBinary, boldBinary } = await loadPdfFontData()

  pdf.addFileToVFS(`${PDF_FONT_NAME}.ttf`, regularBinary)
  pdf.addFont(`${PDF_FONT_NAME}.ttf`, PDF_FONT_NAME, "normal")
  pdf.addFileToVFS(`${PDF_FONT_NAME}-Bold.ttf`, boldBinary)
  pdf.addFont(`${PDF_FONT_NAME}-Bold.ttf`, PDF_FONT_NAME, "bold")
}

const buildReportModel = ({
  reportType,
  orders,
  products,
  users,
  categories,
  orderStatus,
  roleFilter,
  categoryId,
  minStock,
  topLimit,
}: {
  reportType: ReportType
  orders: Order[]
  products: ProductListResponse | undefined
  users: AdminUser[]
  categories: Category[]
  orderStatus: string
  roleFilter: RoleFilter
  categoryId: string
  minStock: number
  topLimit: number
}): ReportModel => {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const productList = products?.items ?? []

  if (reportType === "sales") {
    const filteredOrders =
      orderStatus === "all"
        ? orders
        : orders.filter((order) => order.status === orderStatus)

    const salesMap = new Map<
      number,
      { name: string; category: string; quantity: number; revenue: number }
    >()

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = salesMap.get(item.product_id) ?? {
          name: item.product.name,
          category: categoryNameById.get(item.product.category_id) ?? "Без категории",
          quantity: 0,
          revenue: 0,
        }

        const itemPrice = Number(item.price)

        salesMap.set(item.product_id, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + itemPrice * item.quantity,
        })
      })
    })

    const rows = [...salesMap.values()]
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, topLimit)
      .map((item) => ({
        Товар: item.name,
        Категория: item.category,
        Количество: item.quantity,
        Выручка: formatCurrency(item.revenue),
      }))

    const revenue = filteredOrders.reduce(
      (total, order) => total + Number(order.total_price),
      0
    )

    return {
      title: reportLabels.sales.title,
      subtitle: `${reportLabels.sales.subtitle}. Статус заказов: ${orderStatus === "all" ? "все" : orderStatus}`,
      summary: [
        { label: "Заказов", value: formatNumber(filteredOrders.length) },
        { label: "Выручка", value: formatCurrency(revenue) },
        { label: "Позиции", value: formatNumber(salesMap.size) },
        { label: "Топ товаров", value: formatNumber(Math.min(topLimit, salesMap.size)) },
      ],
      rows,
      columns: ["Товар", "Категория", "Количество", "Выручка"],
    }
  }

  if (reportType === "customers") {
    const filteredUsers =
      roleFilter === "all"
        ? users
        : users.filter((user) => (roleFilter === "admin" ? user.role_id === 1 : user.role_id !== 1))

    const rows = filteredUsers
      .map((user) => {
        const userOrders = orders.filter((order) => order.user_id === user.id)
        const orderCount = userOrders.length
        const revenue = userOrders.reduce((total, order) => total + Number(order.total_price), 0)

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          role: roleLabels[user.role_id] ?? "User",
          orders: orderCount,
          revenue,
        }
      })
      .filter((row) => row.orders >= minStock)
      .sort((left, right) => right.orders - left.orders)
      .map((row) => ({
        Пользователь: row.name,
        Email: row.email,
        Роль: row.role,
        Заказы: row.orders,
        Выручка: formatCurrency(row.revenue),
      }))

    return {
      title: reportLabels.customers.title,
      subtitle: `${reportLabels.customers.subtitle}. Роль: ${roleFilter === "all" ? "все" : roleFilter}`,
      summary: [
        { label: "Пользователей", value: formatNumber(filteredUsers.length) },
        { label: "Активных", value: formatNumber(rows.length) },
        { label: "Минимум заказов", value: formatNumber(minStock) },
        { label: "Всего заказов", value: formatNumber(orders.length) },
      ],
      rows,
      columns: ["Пользователь", "Email", "Роль", "Заказы", "Выручка"],
    }
  }

  const filteredProducts =
    categoryId === "all"
      ? productList
      : productList.filter((product) => String(product.category_id) === categoryId)

  const rows = filteredProducts
    .map((product) => {
      const stockValue = Number(product.price) * product.stock_quantity

      return {
        Товар: product.name,
        Категория: categoryNameById.get(product.category_id) ?? "Без категории",
        Цена: formatCurrency(Number(product.price)),
        Остаток: product.stock_quantity,
        "Сумма остатка": formatCurrency(stockValue),
        Статус: product.stock_quantity <= minStock ? "Низкий" : "Ок",
      }
    })
    .sort((left, right) => Number(left.Остаток) - Number(right.Остаток))

  const lowStockCount = filteredProducts.filter((product) => product.stock_quantity <= minStock).length

  return {
    title: reportLabels.inventory.title,
    subtitle: `${reportLabels.inventory.subtitle}. Порог запаса: ${formatNumber(minStock)}`,
    summary: [
      { label: "Товаров", value: formatNumber(filteredProducts.length) },
      { label: "Низкий запас", value: formatNumber(lowStockCount) },
      { label: "Категорий", value: formatNumber(new Set(filteredProducts.map((product) => product.category_id)).size) },
      { label: "Всего на складе", value: formatNumber(filteredProducts.reduce((total, product) => total + product.stock_quantity, 0)) },
    ],
    rows,
    columns: ["Товар", "Категория", "Цена", "Остаток", "Сумма остатка", "Статус"],
  }
}

const exportReport = async ({
  format,
  template,
  fileName,
  title,
  subtitle,
  summary,
  columns,
  rows,
}: {
  format: ExportFormat
  template: TemplatePreset
  fileName: string
  title: string
  subtitle: string
  summary: SummaryItem[]
  columns: string[]
  rows: ReportRow[]
}) => {
  const black = [0, 0, 0] as const

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new()
    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Параметр", "Значение"],
      ...summary.map((item) => [item.label, item.value]),
    ])
    const dataSheet = XLSX.utils.json_to_sheet(rows)
    const metaSheet = XLSX.utils.aoa_to_sheet([
      ["Поле", "Значение"],
      ["Название", title],
      ["Подзаголовок", subtitle],
      ["Шаблон", templatePresets[template].label],
    ])

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Data")
    XLSX.utils.book_append_sheet(workbook, metaSheet, "Template")

    const data = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    })
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")

    anchor.href = url
    anchor.download = fileName
    anchor.click()

    URL.revokeObjectURL(url)
    return
  }

  if (format === "docx") {
    const formatDocValue = (value: string | number) => String(value)

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: subtitle, color: "000000" }),
              ],
              spacing: { after: 240 },
            }),
            new Paragraph({
              text: `Шаблон: ${templatePresets[template].label}`,
              spacing: { after: 180 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: columns.map(
                    (column) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: column, bold: true })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      })
                  ),
                }),
                ...rows.map(
                  (row) =>
                    new TableRow({
                      children: columns.map(
                        (column) =>
                          new TableCell({
                            children: [
                              new Paragraph({
                                text: formatDocValue(row[column] ?? ""),
                              }),
                            ],
                          })
                      ),
                    })
                ),
              ],
            }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")

    anchor.href = url
    anchor.download = fileName
    anchor.click()

    URL.revokeObjectURL(url)
    return
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  })

  await registerPdfFont(pdf)

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 40
  const textWidth = pageWidth - margin * 2

  const ensureSpace = (nextHeight: number) => {
    if (nextHeight > pageHeight - 48) {
      pdf.addPage()
      return 44
    }

    return nextHeight
  }

  const drawLine = (text: string, y: number, bold = false, size = 11) => {
    pdf.setFont(PDF_FONT_NAME, bold ? "bold" : "normal")
    pdf.setFontSize(size)
    const lines = pdf.splitTextToSize(text, textWidth)
    lines.forEach((line: string) => {
      y = ensureSpace(y)
      pdf.setTextColor(...black)
      pdf.text(line, margin, y)
      y += size + 5
    })

    return y
  }

  let cursorY = 56

  pdf.setTextColor(...black)
  cursorY = drawLine(title, cursorY, true, 20)
  cursorY += 2
  cursorY = drawLine(subtitle, cursorY, false, 11)
  cursorY += 8

  pdf.setFont(PDF_FONT_NAME, "bold")
  pdf.setFontSize(12)
  pdf.setTextColor(...black)
  cursorY = drawLine(`Шаблон: ${templatePresets[template].label}`, cursorY, false, 12)
  cursorY += 8

  summary.forEach((item) => {
    cursorY = ensureSpace(cursorY)
    pdf.setDrawColor(black[0], black[1], black[2])
    pdf.roundedRect(margin, cursorY - 14, textWidth, 30, 10, 10)
    pdf.setTextColor(...black)
    cursorY = drawLine(`${item.label}: ${item.value}`, cursorY + 6, false, 11)
    cursorY += 8
  })

  cursorY += 6
  pdf.setTextColor(...black)
  cursorY = drawLine("Данные", cursorY, true, 14)

  rows.forEach((row, rowIndex) => {
    cursorY = ensureSpace(cursorY)
    cursorY = drawLine(`${rowIndex + 1}. ${columns.map((column) => `${column}: ${String(row[column] ?? "")}`).join(" | ")}`, cursorY, false, 10)
    cursorY += 4
  })

  pdf.save(fileName)
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const [reportType, setReportType] = useState<ReportType>("sales")
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf")
  const [template, setTemplate] = useState<TemplatePreset>("emerald")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [orderStatus, setOrderStatus] = useState("all")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [categoryId, setCategoryId] = useState("all")
  const [topLimit, setTopLimit] = useState(8)
  const [minStock, setMinStock] = useState(5)
  const [showSummary, setShowSummary] = useState(true)

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["reports", "orders"],
    queryFn: getOrders,
  })

  const productsQuery = useQuery<ProductListResponse>({
    queryKey: ["reports", "products"],
    queryFn: () => getProducts({ page: 1, per_page: 250 }),
  })

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["reports", "users"],
    queryFn: getUsers,
  })

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["reports", "categories"],
    queryFn: getCategories,
  })

  const model = buildReportModel({
    reportType,
    orders: ordersQuery.data ?? [],
    products: productsQuery.data,
    users: usersQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    orderStatus,
    roleFilter,
    categoryId,
    minStock,
    topLimit,
  })

  const effectiveTitle = title.trim() || defaultInputs[reportType].title
  const effectiveSubtitle = subtitle.trim() || defaultInputs[reportType].subtitle
  const templateConfig = templatePresets[template]
  const loading =
    ordersQuery.isLoading ||
    productsQuery.isLoading ||
    usersQuery.isLoading ||
    categoriesQuery.isLoading

  const handleExport = async () => {
    const fileName = `${sanitizeFileName(effectiveTitle)}.${exportFormat}`

    await exportReport({
      format: exportFormat,
      template,
      fileName,
      title: effectiveTitle,
      subtitle: effectiveSubtitle,
      summary: showSummary ? model.summary : [],
      columns: model.columns,
      rows: model.rows,
    })
  }

  return (
    <div className="min-h-[calc(100svh-73px)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <button
              className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              onClick={() => navigate("/admin")}
              type="button"
            >
              ← Назад в админку
            </button>

            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">
              Admin reports
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-50 md:text-4xl">
              Формирование отчетов
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {exportFormatOptions.map((option) => (
              <button
                key={option.value}
                className={`rounded-2xl border px-4 py-3 transition ${exportFormat === option.value
                  ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                onClick={() => setExportFormat(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4">
                <h2 className="mt-1 text-xl font-semibold text-slate-50">
                  Тип отчета
                </h2>
              </div>

              <div className="grid gap-3">
                {reportTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-2xl border p-4 text-left transition ${reportType === option.value
                      ? "border-emerald-400/40 bg-emerald-400/15"
                      : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-white/5"
                      }`}
                    onClick={() => setReportType(option.value)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-50">
                          {option.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {option.description}
                        </div>
                      </div>
                      <div className="text-slate-500">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4">
                <h2 className="mt-1 text-xl font-semibold text-slate-50">
                  Шаблон и оформление
                </h2>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Пресет</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                    value={template}
                    onChange={(event) => setTemplate(event.target.value as TemplatePreset)}
                  >
                    {Object.entries(templatePresets).map(([value, preset]) => (
                      <option key={value} value={value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Название отчета</label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                    placeholder={defaultInputs[reportType].title}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Подзаголовок</label>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                    placeholder={defaultInputs[reportType].subtitle}
                    value={subtitle}
                    onChange={(event) => setSubtitle(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-300">
                    <div className="mb-2">Показать сводку</div>
                    <input
                      checked={showSummary}
                      onChange={(event) => setShowSummary(event.target.checked)}
                      type="checkbox"
                    />
                  </label>

                  <div
                    className="rounded-2xl border border-white/10 p-3 text-sm text-slate-300"
                    style={{ backgroundColor: templateConfig.surface }}
                  >
                    <div className="mb-2 text-slate-200">Акцент</div>
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: templateConfig.accent }}
                      />
                      <span>{templateConfig.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4">
                <h2 className="mt-1 text-xl font-semibold text-slate-50">
                  Настраиваемые параметры
                </h2>
              </div>

              {reportType === "sales" && (
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Статус заказа</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      value={orderStatus}
                      onChange={(event) => setOrderStatus(event.target.value)}
                    >
                      <option value="all">Все статусы</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Сколько товаров показывать</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      min={1}
                      max={20}
                      type="number"
                      value={topLimit}
                      onChange={(event) => setTopLimit(Number(event.target.value) || 1)}
                    />
                  </div>
                </div>
              )}

              {reportType === "customers" && (
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Роль</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                    >
                      <option value="all">Все пользователи</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Минимум заказов</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      min={0}
                      type="number"
                      value={minStock}
                      onChange={(event) => setMinStock(Number(event.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              {reportType === "inventory" && (
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Категория</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                    >
                      <option value="all">Все категории</option>
                      {(categoriesQuery.data ?? []).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Порог низкого остатка</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                      min={1}
                      type="number"
                      value={minStock}
                      onChange={(event) => setMinStock(Number(event.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </section>

            <button
              className="w-full rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/15 px-5 py-4 text-base font-semibold text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || model.rows.length === 0}
              onClick={handleExport}
              type="button"
            >
              {loading ? "Подготавливаем данные..." : `Скачать ${exportFormat.toUpperCase()}`}
            </button>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-50">
                    {effectiveTitle}
                  </h2>
                  <p className="mt-2 max-w-3xl text-slate-400">
                    {effectiveSubtitle}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Шаблон: <span className="text-slate-100">{templateConfig.label}</span>
                </div>
              </div>

              {showSummary && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {model.summary.map((item) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                      key={item.label}
                    >
                      <div className="text-sm text-slate-400">{item.label}</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-50">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-white/5 text-sm text-slate-400">
                      <tr>
                        {model.columns.map((column) => (
                          <th className="px-5 py-4 font-medium whitespace-nowrap" key={column}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {model.rows.slice(0, 8).map((row, rowIndex) => (
                        <tr className="border-t border-white/10" key={`${rowIndex}-${model.columns[0]}`}>
                          {model.columns.map((column) => (
                            <td className="px-5 py-4 text-sm text-slate-200 whitespace-nowrap" key={column}>
                              {String(row[column] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {model.rows.length === 0 && (
                  <div className="border-t border-white/10 px-5 py-8 text-center text-slate-400">
                    Нет данных для отчета с выбранными параметрами.
                  </div>
                )}
              </div>

            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
