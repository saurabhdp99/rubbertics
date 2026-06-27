# HeroUI Select Patterns & Supabase Fresh Data Fetching

> Reference guide for reusing these patterns across modules (e.g., Purchase Orders, Invoices, etc.)

---

## 1. HeroUI Select `onSelectionChange` — Value Extraction Bug

### Problem

HeroUI's `<Select>` `onSelectionChange` callback passes the selected key as a **string**, NOT a `Set`.

Using `Array.from(v)[0]` on a string splits it into individual characters:

```js
// ❌ WRONG — splits string into chars
Array.from("30007992")[0]  // → "3" (just the first character!)

// ❌ This was the original broken pattern:
onSelectionChange={(v) => {
  const value = Array.from(v)[0]; // "3" instead of "30007992"
}}
```

### Fix

Always handle both `Set` and `string` return types:

```js
// ✅ CORRECT — handles both Set and string
onSelectionChange={(v) => {
  const value = v instanceof Set ? Array.from(v)[0] : String(v);
  // value is now correctly "30007992"
}}
```

### Where This Applies

Use this pattern in **every** HeroUI `<Select>` `onSelectionChange` handler across the app:
- Sale Orders → Part Number, Party Name
- Any future page using `<Select>` with `onSelectionChange`

---

## 2. Fetching Fresh Data from Supabase (Not from UI Store)

### Why

UI stores (`useItemMasterStore`, `usePartyMasterStore`) may have stale data.
For dropdowns where fresh data matters, fetch directly from Supabase.

### Pattern

```jsx
const [freshItems, setFreshItems] = useState([]);

useEffect(() => {
  const fetchItems = async () => {
    if (currentOrg?.id) {
      const { data, error } = await supabase
        .from('item_master')
        .select('item_code, item_name')
        .eq('org_id', currentOrg.id);
      if (!error && data) {
        setFreshItems(data);
      }
    }
  };
  fetchItems();
}, [currentOrg]);
```

### Key Points
- Fetch **only the columns you need** (`item_code, item_name`) for performance
- Filter by `org_id` to scope data to the current organization
- Store in local component state (`useState`), not in global store
- Dependency array includes `currentOrg` so it re-fetches on org change

---

## 3. Auto-Populating Related Fields on Selection

### Pattern: Select Part Number → Auto-fill Product Name

```jsx
<Controller
  control={control}
  name={`items.${index}.partNo`}
  render={({ field: { onChange, value } }) => (
    <Select
      selectedKeys={value ? [value] : []}
      onSelectionChange={(v) => {
        const partNo = v instanceof Set ? Array.from(v)[0] : String(v);
        if (!partNo) return;
        onChange(partNo);

        // Lookup from pre-fetched data (no extra API call)
        const matchedItem = freshItems.find(i => i.item_code === partNo);
        if (matchedItem) {
          setValue(`items.${index}.productName`, matchedItem.item_name || '', {
            shouldValidate: true,
            shouldDirty: true
          });
        }
      }}
    >
      {/* ... trigger and list items ... */}
    </Select>
  )}
/>
```

### Key Points
- Match against pre-fetched `freshItems` array — **no extra Supabase call per selection**
- Use `setValue` with `{ shouldValidate: true, shouldDirty: true }` to trigger re-render
- The target field (Product Name) should be a **plain `<Input>`** (read-only), NOT a `<Select>`, because HeroUI Select doesn't reliably re-render when set programmatically via `setValue`

---

## 4. HeroUI Select Does NOT Re-Render on Programmatic `setValue`

### Problem

When you programmatically set a value on a HeroUI `<Select>` via react-hook-form's `setValue`, the Select component does **not** update its displayed text, even with `shouldValidate: true`.

### Solution

If a field's value is auto-populated (not user-selected), use a **plain `<Input>`** instead of `<Select>`:

```jsx
<Controller
  control={control}
  name={`items.${index}.productName`}
  render={({ field: { value } }) => (
    <Field label="Product Name">
      <Input
        type="text"
        value={value || ''}
        disabled
        readOnly
        placeholder="Auto-filled from Part Number"
        className={`${inputCls} px-4 py-3 bg-slate-50 text-slate-600`}
        aria-label="Product Name"
      />
    </Field>
  )}
/>
```

### Rule of Thumb
| Scenario | Component |
|---|---|
| User selects from a list | `<Select>` |
| Value is auto-populated from another field | `<Input readOnly>` |

---

## 5. Party Name → Address Auto-Fill (Same Pattern)

The same fresh-fetch + auto-fill pattern is used for Party Name → Party Address:

```jsx
onSelectionChange={async v => {
  const partyName = v instanceof Set ? Array.from(v)[0] : String(v);
  if (!partyName) return;
  onChange(partyName);

  // Fetch address from Supabase
  if (currentOrg?.id) {
    const { data, error } = await supabase
      .from('party_master')
      .select('address')
      .eq('party_name', partyName)
      .eq('org_id', currentOrg.id)
      .single();
    if (!error && data) {
      setValue('partyAddress', data.address || '');
    }
  }
}}
```

> **Note**: Party Address is fetched per-selection (`.single()`) because we only need one record. Item data is pre-fetched in bulk because multiple items may be selected per form.

---

## 6. Supabase `.single()` Error Handling

When using `.single()`, Supabase throws `PGRST116` if 0 rows are returned. Always handle this:

```js
// ✅ Safe pattern
const { data, error } = await supabase
  .from('table')
  .select('column')
  .eq('filter', value)
  .single();

if (!error && data) {
  // use data
} else {
  // fallback to store data or empty string
}
```

---

## Quick Checklist for New Modules

When building a new page with dropdowns + auto-fill:

- [ ] Use `v instanceof Set ? Array.from(v)[0] : String(v)` in ALL `onSelectionChange` handlers
- [ ] Fetch dropdown data from Supabase in `useEffect` for fresh data
- [ ] Use `<Input readOnly>` for auto-populated fields, NOT `<Select>`
- [ ] Pass `{ shouldValidate: true, shouldDirty: true }` to `setValue`
- [ ] Handle `.single()` errors gracefully (check `!error && data`)
- [ ] Filter by `org_id` in all Supabase queries
