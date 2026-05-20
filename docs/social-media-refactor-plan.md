# Refactor `/social-media` Backend Integration — Plan

**Target repo:** `/Users/metwally/Desktop/maaal-frontend-trading-room`
**Target route:** `app/[locale]/(dashboard)/social-media`
**Reference spec:** [./social-media-api.md](./social-media-api.md) — Riyadh Chamber Social Media API (Postman collection)
**Goal:** align hooks, types, payloads, and forms with the documented collection without breaking existing UI/UX.

---

## 0. Resolved decisions (locked before coding)

These are the answers chosen to minimize conflict with the backend during integration. They follow the documented Postman collection wherever it disagrees with current code.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| Q1 | Does `POST /projects/{id}/social-media/accounts` exist for "Link via API"? | **Keep**, but send `{ platform, credentials }` | Endpoint is referenced from current UI, but body shape must match the documented `verify` shape so backend treats credentials uniformly. |
| Q2 | Does `POST /projects/{id}/social-media/posts/refresh` exist? | **Remove** `refreshPosts` | Not documented. Removing avoids a 404 surface and any UI control that hits it. Sync via `/posts/sync` covers the use case. |
| Q3 | JSON or multipart for manual create / update? | **JSON by default**, multipart **only** when a `File` is included | Docs use JSON. JSON serializes nested `demographics` / `platform_specific` natively. Fallback to multipart with Laravel bracket notation only when uploading a `profile_image` or `media` file. |
| Q4 | Is `preset=day` valid for reports? | **Keep `day`** | API guide §3.4 + the drop-in TS type both list `day|week|month|quarter|year`. Do not narrow the union. |
| Q5 | Should `account_identifier` continue being sent? | **Drop from outbound payload only**; keep optional on response types | Not in the documented request body, but current UI uses it as a fallback display field when reading account data. |

If the backend later disagrees on any of these, only the `useSocialMediaMutations` factory and the affected form need to change — types stay valid.

### 0.1 Scoping note (do not over-refactor)

The biggest implementation risk lives **outside** the hook layer:

- The **merged report UI** (under `…/social-media/reports` and `…/social-media/updated`) uses several client-side controls that are not part of the backend contract. They must keep working.
- The **Link via API entry points** and the **manual account / post dialogs** must be updated together — the dialogs currently share components (`AddPostDialog` is reused for edit), so a payload change in one path can leak into the other.

Plan tasks below explicitly call out which surfaces are touched.

---

## 1. Types (`types/social-media.ts`)

### 1.1 Add

```ts
export type SocialPlatform =
  | "twitter" | "facebook" | "instagram"
  | "youtube" | "linkedin" | "snapchat" | "tiktok";

export interface SocialApiEnvelope<T> {
  data: T;
  message?: string;
  status?: number;
  // Tolerate legacy Laravel envelope:
  success?: boolean;
  errors?: Record<string, string[]> | null;
}

export interface Demographics {
  gender?: { male?: number; female?: number; other?: number };
  age_groups?: Partial<Record<"18-24" | "25-34" | "35-44" | "45-54" | "55+", number>>;
  top_countries?: { name: string; code: string; percentage: number }[]; // max 10 entries
  devices?: { mobile?: number; desktop?: number; tablet?: number };
}

export type PlatformSpecific = Record<string, unknown>;

export interface ManualAccountPostInput {
  title: string;
  published_at?: string; // ISO 8601
  content?: string;
  post_url?: string;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  platform_specific?: PlatformSpecific;
}

export interface ManualAccountInput {
  platform: SocialPlatform;
  account_name: string;
  account_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  total_reach?: number;
  total_impressions?: number;
  total_views?: number;
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
  engagement_rate?: number;
  growth_rate?: number;
  platform_specific?: PlatformSpecific;
  demographics?: Demographics;
  posts?: ManualAccountPostInput[];
  profile_image?: File; // optional — triggers multipart fallback
}

export interface ManualPostInput extends ManualAccountPostInput {
  media?: File; // optional — triggers multipart fallback
}

export interface UpdateManualStatisticsInput {
  account_name?: string;
  account_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  total_reach?: number;
  total_impressions?: number;
  total_views?: number;
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
  engagement_rate?: number;
  growth_rate?: number;
  platform_specific?: PlatformSpecific;
  demographics?: Demographics;
}

export interface VerifyCredentialsInput {
  platform: SocialPlatform;
  credentials: Record<string, string>;
}

export interface ConnectApiAccountInput {
  platform: SocialPlatform;
  credentials: Record<string, string>;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  post_url?: string;
}
```

### 1.2 Replace

- `CreateManualAccountRequest` → `ManualAccountInput`
- `AddManualPostRequest` → `ManualPostInput`
- `UpdateManualStatisticsRequest` → `UpdateManualStatisticsInput`
- `ConnectAccountRequest` → `ConnectApiAccountInput`
- `VerifyAccountRequest` → `VerifyCredentialsInput`
- `CreateManualAccountPostInput` → `ManualAccountPostInput`

### 1.3 Reports filter narrowing

```ts
// Keep `day` — listed in API guide §3.4 and the drop-in TS type.
export type SocialMediaReportPreset = "day" | "week" | "month" | "quarter" | "year";
export type SocialMediaReportPeriod = SocialMediaReportPreset | "custom";

// Keep these EXPORTED — the merged report UI uses them as client-side controls.
export type SocialMediaReportAccountType = "all" | "api" | "manual";
export type SocialMediaReportSort = "engagement" | "likes" | "reach" | "views";

export interface SocialMediaReportFilters {
  preset?: SocialMediaReportPeriod;
  from?: string | null;
  to?: string | null;
  // Client-side only — never sent to the backend.
  // Kept on the type because the report UI binds to them.
  platforms?: SocialPlatform[];
  accounts?: Array<string | number>;
  account_type?: SocialMediaReportAccountType;
  sort?: SocialMediaReportSort;
}
```

Rule: **`SocialMediaReportFilters` keeps every current field**, but `buildSocialMediaReportQueryParams` (§2.4) only forwards `preset` / `from` / `to` to the backend. The other fields stay client-side.

### 1.4 Leave alone

- `SocialMediaReportDemographics`, `SocialMediaReportData`, `SocialMediaReportResponse` — these describe the **response** of `/report` and use different keys (`gender_distribution`, `device_type_used`, etc.). They are orthogonal to account-side `Demographics`.
- `account_identifier` on `SocialMediaAccount` and any response shape — keep as optional. Only the **outbound** payload drops it.

### 1.5 Mutation envelope caveat

If `useMutation<T>` in this codebase already constrains `T` with `success?: boolean` / `status?: boolean`, do **not** plug `SocialApiEnvelope<T>` (which uses `status?: number`) into that generic — it will fail type checking. Two safe options:

1. Don't type the mutation hook with `SocialApiEnvelope`. Type only the read paths (`useQuery<…Response>`) with it.
2. Widen the shared mutation generic so `status` is `number | boolean | undefined`.

Pick option 1 unless option 2 is trivially safe — option 1 has zero blast radius.

---

## 2. Hook (`hooks/use-social-media.ts`)

### 2.1 Endpoint map (final)

| Action | Method | Path | Body |
|---|---|---|---|
| Dashboard | GET | `/projects/{id}/social-media?per_page=20` | — |
| List accounts | GET | `/projects/{id}/social-media/accounts` | — |
| Account detail | GET | `/projects/{id}/social-media/accounts/{accountId}` | — |
| Create manual account | POST | `/projects/{id}/social-media/manual-accounts` | `ManualAccountInput` |
| Update stats + demographics | POST | `/projects/{id}/social-media/accounts/{accountId}/manual-statistics` | `UpdateManualStatisticsInput` |
| Disconnect account | DELETE | `/projects/{id}/social-media/accounts/{accountId}` | — |
| Sync accounts | POST | `/projects/{id}/social-media/accounts/sync` | — |
| Refresh accounts | POST | `/projects/{id}/social-media/accounts/refresh` | — |
| Verify credentials | POST | `/projects/{id}/social-media/accounts/verify` | `VerifyCredentialsInput` |
| Connect API account | POST | `/projects/{id}/social-media/accounts` | `ConnectApiAccountInput` |
| List posts | GET | `/projects/{id}/social-media/posts` | — |
| Add manual post | POST | `/projects/{id}/social-media/accounts/{accountId}/manual-posts` | `ManualPostInput` |
| Update post | **PUT** | `/projects/{id}/social-media/posts/{postId}` | `UpdatePostInput` |
| Sync posts | POST | `/projects/{id}/social-media/posts/sync` | `{ account_id: number }` |
| Delete post | DELETE | `/projects/{id}/social-media/accounts/{accountId}/posts/{postId}` | — |
| Report JSON | GET | `/projects/{id}/social-media/report` | query: `preset` or `from`/`to` |
| Report PDF | GET | `/projects/{id}/social-media/report/pdf` | query: same; `Accept: application/pdf` |
| Report CSV | GET | `/projects/{id}/social-media/report/csv` | query: same; `Accept: text/csv` |

### 2.2 Removed

- `refreshPosts()` (Q2)
- The `/posts/refresh` URL string anywhere it appears
- `_method: 'PUT'` override in `updatePost` (use real `PUT`)
- The dual `accounts/{accountId}/posts/{postId}` URL form for `updatePost`
- `account_identifier` form field (Q5)

### 2.3 Body serialization helper

Replace `buildManualAccountFormData` and `buildManualPostFormData` with a single rule:

```ts
function hasFile(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (obj instanceof File) return true;
  return Object.values(obj as Record<string, unknown>).some(hasFile);
}

// JSON path is the default; multipart only kicks in when a File is anywhere in the payload.
async function postPayload(url: string, data: object, rbacKey: string) {
  if (hasFile(data)) {
    return apiClient.post(url, toLaravelFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
      rbac: { actionKey: rbacKey },
    });
  }
  return apiClient.post(url, data, {
    headers: { "Content-Type": "application/json" },
    rbac: { actionKey: rbacKey },
  });
}
```

`toLaravelFormData(data)` rules (only used when a File is present):
- Scalars: `formData.append(key, String(value))`.
- Files: `formData.append(key, file)`.
- Plain objects: recurse with `${parent}[${childKey}]`.
- Arrays: recurse with `${parent}[${index}]`.
- `null`/`undefined`: skip the field.

This serializer covers `platform_specific[*]`, `demographics[gender][male]`, `demographics[top_countries][0][code]`, `posts[0][platform_specific][saves]`, etc.

### 2.4 Report query builder

```ts
export function buildSocialMediaReportQueryParams(
  filters: SocialMediaReportFilters = {},
): FetcherParams {
  const preset = filters.preset ?? "month";
  if (preset === "custom") {
    const params: FetcherParams = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    return params;
  }
  return { preset }; // accepts "day" | "week" | "month" | "quarter" | "year"
}
```

`platforms`, `accounts`, `account_type`, `sort` are intentionally read but **not** forwarded — they're client-side display controls now (see §1.3). No `platforms[]`, `accounts[]`, `account_type`, or `sort` keys ever appear in the network request.

### 2.5 Download helper

`downloadBlob` must inject the right `Accept` header per export:

```ts
const downloadCsv = (filters) => downloadBlob(buildDownloadUrl("csv", filters), "...csv", "text/csv");
const downloadPdf = (filters) => downloadBlob(buildDownloadUrl("pdf", filters), "...pdf", "application/pdf");

async function downloadBlob(url: string, filename: string, accept: string) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Accept-Language": acceptLanguage, Accept: accept },
  });
  // ...rest unchanged
}
```

### 2.6 Mutations factory shape (final exports)

```ts
return {
  // Connect / verify
  connectAccount,        // ConnectApiAccountInput
  verifyAccount,         // VerifyCredentialsInput
  // Account ops
  createManualAccount,   // ManualAccountInput
  updateManualStatistics,// UpdateManualStatisticsInput
  syncAccounts,
  refreshAccounts,
  deleteAccount,
  // Post ops
  addManualPost,         // (accountId, ManualPostInput)
  updatePost,            // (postId, UpdatePostInput)  ← no accountId overload
  deletePost,            // (postId, accountId)
  syncPosts,             // ({ account_id }) — required by docs
  // (refreshPosts removed)
  isLoading,
};
```

---

## 3. Forms / Dialogs

Files under `app/[locale]/(dashboard)/social-media/{link-via-api,link-manual,post,accounts,reports,...}` plus any shared dialog used to build payloads.

### 3.1 Link via API form
- Output: `ConnectApiAccountInput` → `{ platform, credentials: {...} }`.
- Per-platform credentials inputs (example for Twitter/X): `api_key`, `api_secret`, `access_token`, `access_token_secret`. Other platforms: whatever fields backend expects. **No more `account_id` + `access_token` flat shape.**
- **Platform whitelist** — restrict the platform selector to the documented set:
  `instagram`, `twitter`, `linkedin`, `youtube`, `snapchat`, `tiktok`, `facebook`.
  Remove **`telegram`, `google_ads`, `google_ad_manager`, `google_analytics`** from this flow unless backend explicitly confirms support. (They may live in a different integrations area; do not delete them globally — only remove from this social-media flow.)

### 3.2 Verify credentials button
- Calls `verifyAccount({ platform, credentials })` using the same fields the form would submit.

### 3.3 Manual account form
- Output: `ManualAccountInput`.
- Sub-form panels:
  - **Account metrics** (followers, posts, reach, impressions, etc.)
  - **`platform_specific`** — platform-aware sub-form. Use the per-platform shape from [`social-media-api.md` §5](./social-media-api.md#5-platform_specific-field-reference).
  - **`demographics`** — gender / age_groups / top_countries / devices.
  - **Initial posts** (optional array).
- `profile_image` triggers multipart automatically (Q3).

### 3.4 Manual post form (CREATE mode)
- Output: `ManualPostInput`.
- Replace the `platform_specific.quotes_count` hard-coded field with a platform-aware sub-form (Twitter → `quotes_count|bookmarks`, Instagram → `saves|profile_visits|link_clicks`, etc.).
- `media` triggers multipart automatically.

### 3.4.1 Manual post EDIT mode (`AddPostDialog` reused)
The current edit dialog reuses `AddPostDialog` and includes stats + media fields. The documented `PUT /posts/{postId}` body is **only** `{ title?, content?, post_url? }`. Two acceptable implementations:

- **Preferred:** in edit mode, hide stats and media inputs, and submit only `UpdatePostInput`.
- **Alternative:** keep the form fields visible but **strip everything except `title`, `content`, `post_url` from the payload** before calling `updatePost`.

Either way, the network body sent to `PUT /posts/{postId}` must contain **no** `impressions`, `reach`, `likes`, `comments`, `shares`, `views`, `platform_specific`, `media`, or `published_at`.

### 3.5 Account stats update form
- Output: `UpdateManualStatisticsInput` (no `platform`, all other fields optional).

### 3.6 Reports filter UI
- **Keep** the existing platforms / accounts / account_type / sort controls — the merged report UI uses them as **client-side** filters/sort over already-fetched data.
- **Do not** forward those values into the request: `buildSocialMediaReportQueryParams` (§2.4) ignores them.
- Add `day` to the preset selector if it's currently missing.

### 3.7 `syncPosts` caller (no UI today, but the contract changed)
The hook now requires `{ account_id }`:
```ts
syncPosts: (accountId: number) => collectionAction(..., 'sync', ..., { account_id: accountId })
```
- Audit current callers — there is **no global "Sync All Posts" button** in the existing UI today, so no breakage on day one.
- If/when a global sync button is added, it must include an **account selector** (single account at a time per the doc), or iterate per account.

---

## 4. Empty / nullable rendering

Keep current "real-data only" rendering. If the API omits `demographics`, `platform_specific`, or any metric, render the existing empty state. Do not synthesize values.

---

## 5. Test plan

### 5.1 Static
- `npm run lint` — focus on `hooks/use-social-media.ts`, `types/social-media.ts`, every touched dialog/container.
- `npm run build`.
- `tsc --noEmit` if the project enables it (catches type-replacement breakage).

### 5.2 Manual smoke (against dev backend)
For each call, inspect the network request in DevTools and confirm URL, method, headers (`Authorization`, `Accept`, `Content-Type`), and body shape.

- Dashboard: `GET …/social-media?per_page=20` returns 200.
- Connect API account: `POST …/accounts` body `{ platform, credentials }`.
- Verify credentials: `POST …/accounts/verify` body `{ platform, credentials }`.
- Sync accounts / Refresh accounts: empty body, 200.
- Create manual account (no file): `Content-Type: application/json`, body includes `platform_specific`, `demographics`, optional `posts[]`.
- Create manual account (with `profile_image`): `Content-Type: multipart/form-data`, nested fields use `[bracket][notation]`.
- Update manual stats: body **without** `platform`.
- Add manual post: platform-correct `platform_specific` keys.
- Update post: `PUT …/posts/{id}` (no `_method` override).
- Delete post: `DELETE …/accounts/{accountId}/posts/{postId}`.
- Sync posts: `POST …/posts/sync` body `{ account_id }`.
- Report JSON: query has only `preset` or `from`/`to`.
- Report PDF: response `Content-Type: application/pdf`, downloads.
- Report CSV: response `Content-Type: text/csv`, downloads.

### 5.3 Forbidden in any request
None of the following should appear in network traffic anymore:
- `platforms[]`, `accounts[]`, `account_type`, `sort` query params on `/report*`
- `_method=PUT` body field
- `account_identifier` field in any **outbound** payload (response is fine)
- `/posts/refresh` URL
- `PUT /posts/{id}` body fields other than `title`, `content`, `post_url`
- `platform: "telegram" | "google_ads" | "google_ad_manager" | "google_analytics"` from the Link via API flow

### 5.4 Allowed (sanity checks)
- `preset=day` is a valid value and must not be filtered out.
- Client-side report controls (`platforms`, `accounts`, `account_type`, `sort`) must continue to update the rendered report without a network round-trip.

---

## 6. Implementation order

1. **Types** — add new types, replace request types, narrow report filter.
2. **Hook** — endpoint map, JSON-by-default serializer, report query builder, real `PUT`, drop `refreshPosts` and `account_identifier`, fix download `Accept` headers.
3. **Forms** — Link via API → Verify → Manual account → Manual stats → Manual post → Update post → Reports filters.
4. **Cleanup** — delete dead code paths (dual update-post URL, refresh-posts UI control, removed report filters).
5. **Smoke test** (§5.2).
6. **Lint + build**.

---

## 7. Out of scope

- `SocialMediaReportDemographics` and any other types describing report responses.
- RBAC `actionKey` strings (keep as-is).
- `useProject`, `useQuery`, `useQueryPagination`, `useMutation` infrastructure.
- Visual/UX changes that are not driven by payload changes.

---

## 8. Risk register

| Risk | Mitigation |
|---|---|
| Backend rejects JSON body for `manual-accounts` (expects multipart) | The serializer auto-falls-back to multipart whenever a `File` is present. If it rejects JSON without files too, flip the helper to always-multipart — type contracts don't change. |
| Backend still supports `_method=PUT` only (not real `PUT`) | Revert just `updatePost` to `apiClient.post(url, { ...data, _method: "PUT" })` — isolated change. |
| Backend keeps `account_identifier` requirement | Re-add a single line in `createManualAccount` payload assembly. Response-side type already keeps it. |
| `Connect API account` endpoint shape differs per platform | `credentials` is `Record<string, string>` — accepts any per-platform key set, no type change needed. |
| Edit-post dialog (`AddPostDialog` reuse) leaks stats/media into `PUT /posts/{id}` | Strip-on-submit in edit mode (§3.4.1). Add a unit/manual check that the network body has only `title|content|post_url`. |
| Mutation generic conflict on `SocialApiEnvelope.status` (number vs boolean) | Don't type mutation hooks with `SocialApiEnvelope` (§1.5 option 1). |
| Removing `telegram`/`google_*` from Link via API breaks other integration screens | Only remove from the social-media flow's platform list; do not delete the enum values globally. |
