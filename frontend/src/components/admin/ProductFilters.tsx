import { useState } from "react"

export default function ProductFilters({
  categories,
  onChange,
}: any) {
  const initialFilters = {
    name: "",
    min_price: "",
    max_price: "",
    category_id: "",
    order_by: "",
  }

  const [draftFilters, setDraftFilters] = useState(initialFilters)

  const handleReset = () => {
    setDraftFilters(initialFilters)
    onChange({})
  }

  return (
    <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-6">

      <input
        placeholder="Name"
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
        value={draftFilters.name}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Min price"
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
        value={draftFilters.min_price}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            min_price: e.target.value,
          })
        }
      />

      <input
        placeholder="Max price"
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
        value={draftFilters.max_price}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            max_price: e.target.value,
          })
        }
      />

      <select
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
        value={draftFilters.category_id}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            category_id: e.target.value,
          })
        }
      >
        <option value="">
          All categories
        </option>

        {categories.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
        value={draftFilters.order_by}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            order_by: e.target.value,
          })
        }
      >
        <option value="">
          Default
        </option>

        <option value="price">
          Price
        </option>

        <option value="name">
          Name
        </option>
      </select>

      <div className="flex gap-2 md:col-span-1">
        <button
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100 transition hover:bg-white/10"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>

        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-slate-950 transition hover:bg-emerald-400"
          onClick={() => onChange(draftFilters)}
          type="button"
        >
          Apply
        </button>
      </div>

    </div>
  )
}
