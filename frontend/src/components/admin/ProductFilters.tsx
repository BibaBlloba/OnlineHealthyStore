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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">

      <input
        placeholder="Name"
        className="border p-2"
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
        className="border p-2"
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
        className="border p-2"
        value={draftFilters.max_price}
        onChange={(e) =>
          setDraftFilters({
            ...draftFilters,
            max_price: e.target.value,
          })
        }
      />

      <select
        className="border p-2"
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
        className="border p-2"
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
          className="border px-4 py-2 rounded"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => onChange(draftFilters)}
          type="button"
        >
          Apply
        </button>
      </div>

    </div>
  )
}
