# wasm-lookup

Fast in-memory business index compiled to WebAssembly. Replaces O(n) `select('*')` scans in WhatsApp/Email inbound routes with O(1) HashMap lookups.

## Build

### Prerequisites
- Rust toolchain (`rustup`)
- `wasm-pack` for WASM builds: `cargo install wasm-pack`

### Compile to WASM (for Next.js / Node.js)
```bash
wasm-pack build --target nodejs --release
```

This outputs to `pkg/` with `.wasm` + JS/TS bindings.

### Compile native (for testing)
```bash
cargo build --release
cargo test
```

## Usage in Next.js

```typescript
// lib/business-index.ts
import { BusinessIndex } from '../../tools/wasm-lookup/pkg/wasm_lookup';

// Singleton index — loaded once at server startup
let index: BusinessIndex | null = null;

export function getBusinessIndex(): BusinessIndex {
  if (!index) {
    index = new BusinessIndex();
  }
  return index;
}

// Load all businesses from Supabase into the index
export async function loadBusinesses(supabase: SupabaseClient) {
  const idx = getBusinessIndex();
  const { data } = await supabase
    .from('businesses')
    .select('id, whatsapp_phone_id, email, widget_domain');

  if (data) {
    const json = JSON.stringify(data.map(b => ({
      id: b.id,
      phone_id: b.whatsapp_phone_id || '',
      email: b.email || '',
      domain: b.widget_domain || '',
    })));
    idx.bulk_load(json);
  }
}
```

### In API routes

```typescript
// app/api/whatsapp/route.ts
import { getBusinessIndex } from '@/lib/business-index';

export async function POST(req: Request) {
  const body = await req.json();
  const phoneId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

  const idx = getBusinessIndex();
  const businessId = idx.lookup_by_phone(phoneId);

  if (!businessId) {
    return new Response('Business not found', { status: 404 });
  }

  // Continue with businessId...
}
```

## API Reference

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `new()` | — | `BusinessIndex` | Empty index |
| `add_business(id, phone, email, domain)` | all strings, pass `""` to skip | void | Add/update a business |
| `bulk_load(json)` | JSON array string | count | Load many at once |
| `remove_business(id)` | business_id | void | Remove from all indexes |
| `lookup_by_phone(phone_id)` | phone_id | business_id or `""` | O(1) lookup |
| `lookup_by_email(email)` | email (case-insensitive) | business_id or `""` | O(1) lookup |
| `lookup_by_domain(domain)` | domain (case-insensitive) | business_id or `""` | O(1) lookup |
| `has_business(id)` | business_id | boolean | Check existence |
| `stats()` | — | JSON string | Entry counts |

## Performance

- **Lookup:** O(1) average via HashMap
- **Add/Remove:** O(1) average
- **Bulk load:** O(n) for n businesses
- **Memory:** ~200 bytes per business (3 HashMap entries + reverse index)
