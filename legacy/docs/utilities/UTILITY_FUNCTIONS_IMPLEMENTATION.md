# Utility Functions & Hooks Implementation

This document lists all utility functions and hooks implemented based on the sheets repo pattern.

## 📁 File Structure

```
reference-sheet/src/
├── hooks/
│   ├── useRequest.ts              # ✅ IMPLEMENTED - API call hook
│   ├── useDecodedUrlParams.ts     # ✅ UPDATED - URL params hook
│   └── usePageTitle.ts            # ✅ UPDATED - Page title hook
└── utils/
    ├── encodeDecodeUrl.ts         # ✅ UPDATED - URL encoding/decoding
    └── truncateName.ts             # ✅ CREATED - String truncation
```

---

## 1. Hooks

### 1.1. `useRequest` - API Call Hook

**Location:** `src/hooks/useRequest.ts`

**Purpose:** Wrapper around `axios-hooks` for making HTTP API calls with token authentication

**Features:**

- Axios instance with base URL configuration
- Request interceptor adds token from `window.accessToken`
- Response interceptor handles request cancellation
- Returns `useAxios` hook from `axios-hooks`

**Usage:**

```typescript
import useRequest from "@/hooks/useRequest";

const [{ loading, data, error }, trigger] = useRequest(
	{
		method: "post",
		url: "/sheet/get_sheet",
	},
	{ manual: true }, // Don't auto-execute
);

// Manual trigger
const response = await trigger({
	data: { baseId: "123", include_tables: true },
});
```

**Dependencies:**

- `axios` - HTTP client
- `axios-hooks` - React hooks for axios

---

### 1.2. `useDecodedUrlParams` - URL Params Hook

**Location:** `src/hooks/useDecodedUrlParams.ts`

**Purpose:** Decode URL query parameters from base64 encoded string

**Returns:**

- `workspaceId` (w)
- `projectId` (pr)
- `parentId` (pa)
- `assetId` (a)
- `tableId` (t)
- `viewId` (v)
- `aiOption` (ai) - defaults to "companies"
- `decodedParams` - Full decoded object
- `searchParams` - React Router search params
- `setSearchParams` - Function to update URL params

**Usage:**

```typescript
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";

const { assetId, tableId, viewId, setSearchParams, decodedParams } =
	useDecodedUrlParams();
```

**Dependencies:**

- `react-router-dom` - For `useSearchParams`
- `encodeDecodeUrl` utility

---

### 1.3. `usePageTitle` - Page Title Hook

**Location:** `src/hooks/usePageTitle.ts`

**Purpose:** Update document title and restore on unmount

**Usage:**

```typescript
import { usePageTitle } from "@/hooks/usePageTitle";

usePageTitle("My Sheet Name");
```

**Features:**

- Sets document title
- Restores previous title on unmount
- Handles null/undefined values

---

## 2. Utility Functions

### 2.1. `encodeParams` / `decodeParams` - URL Encoding

**Location:** `src/utils/encodeDecodeUrl.ts`

**Purpose:** Encode/decode objects to/from base64 strings for URL storage

**Functions:**

#### `encodeParams(data: any): string`

Encodes object to base64 string

```typescript
import { encodeParams } from "@/utils/encodeDecodeUrl";

const params = { a: "base-1", t: "table-1", v: "view-1" };
const encoded = encodeParams(params);
// Result: "eyJhIjoiYmFzZS0xIiwidCI6InRhYmxlLTEiLCJ2Ijoidmlldy0xIn0="
```

#### `decodeParams(base64String: string): any`

Decodes base64 string to object

```typescript
import { decodeParams } from "@/utils/encodeDecodeUrl";

const decoded = decodeParams("eyJhIjoiYmFzZS0xIn0=");
// Result: { a: "base-1" }
// Returns {} if decoding fails
```

---

### 2.2. `truncateName` - String Truncation

**Location:** `src/utils/truncateName.ts`

**Purpose:** Truncate long strings with ellipsis for display

**Usage:**

```typescript
import truncateName from "@/utils/truncateName";

const short = truncateName("Very Long Name That Needs Truncation", 20);
// Result: "Very Long Name Tha..."
```

**Parameters:**

- `name: string | null | undefined` - String to truncate
- `limit: number` - Maximum length (default: 40)

**Returns:** Truncated string with "..." if needed

---

## 3. Environment Variables

**Required:**

- `REACT_APP_API_BASE_URL` - Backend API base URL

**Example `.env`:**

```
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

---

## 4. Global Window Interface

The following is automatically available via global type declaration:

```typescript
window.accessToken?: string;
```

This token is used for:

- Socket.io authentication (query param)
- HTTP request authentication (header)

---

## 5. Usage Examples

### Example 1: Fetch Sheet Data

```typescript
import useRequest from "@/hooks/useRequest";

const [{ loading }, getSheetTrigger] = useRequest(
	{
		method: "post",
		url: "/sheet/get_sheet",
	},
	{ manual: true },
);

const getSheet = async (baseId: string) => {
	try {
		const response = await getSheetTrigger({
			data: {
				baseId,
				include_views: true,
				include_tables: true,
			},
		});
		const { data } = response;
		return data;
	} catch (error) {
		const { isCancel } = error || {};
		if (isCancel) return;
		console.error("Error:", error);
	}
};
```

### Example 2: Update URL Params

```typescript
import { useDecodedUrlParams } from "@/hooks/useDecodedUrlParams";
import { encodeParams } from "@/utils/encodeDecodeUrl";

const { decodedParams, setSearchParams } = useDecodedUrlParams();

const updateTable = (newTableId: string, newViewId: string) => {
	const updatedParams = {
		...decodedParams,
		t: newTableId,
		v: newViewId,
	};

	const encoded = encodeParams(updatedParams);
	setSearchParams({ q: encoded });
};
```

### Example 3: Error Handling with useRequest

```typescript
import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

const [{ loading }, trigger] = useRequest(
	{ method: "post", url: "/api/endpoint" },
	{ manual: true },
);

const makeRequest = async () => {
	try {
		const response = await trigger({ data: { ... } });
		return response;
	} catch (error) {
		const { isCancel } = error || {};

		if (isCancel) {
			return; // Request was cancelled, ignore
		}

		// Handle other errors
		const message = error?.response?.data?.message || "Something went wrong";
		console.error(truncateName(message, 50));
	}
};
```

---

## 6. Implementation Status

✅ **Completed:**

- [x] `useRequest.ts` - Created in `src/hooks/`
- [x] `useDecodedUrlParams.ts` - Updated to match sheets pattern
- [x] `usePageTitle.ts` - Updated to match sheets pattern
- [x] `encodeDecodeUrl.ts` - Updated to match sheets pattern
- [x] `truncateName.ts` - Created in `src/utils/`
- [x] Removed old `useRequest.ts` from `src/common/http/`

---

## 7. Next Steps

These utilities are now ready to use for:

1. **TabBar Implementation** - Using `useDecodedUrlParams` for table switching
2. **Sheet Data Fetching** - Using `useRequest` for API calls
3. **Room Management** - Using socket with token from `window.accessToken`
4. **URL Management** - Using `encodeParams`/`decodeParams` for navigation

---

## 8. Notes

- All hooks follow the sheets repo pattern exactly
- TypeScript types are maintained for type safety
- Error handling matches sheets implementation
- Token authentication works with both HTTP and WebSocket



