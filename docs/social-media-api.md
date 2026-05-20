# Riyadh Chamber — Social Media API

Complete frontend integration guide for the Social Media API collection (Accounts, Posts, Statistics, Demographics, and Reports).

- **Source:** Postman collection `Riyadh Chamber — Social Media API` (id `40597903-3b581322-72a0-4242-84d1-9e43d769f275`)
- **Base URL:** `{{BASE_URL}}/api/v1`
- **Auth:** Bearer token (Laravel **Sanctum**)
- **Default content type:** `application/json`
- **Default accept header:** `application/json` (except PDF/CSV exports)

---

## 1. Conventions

### 1.1 Required headers (every authenticated request)

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <SANCTUM_TOKEN>
```

For PDF export use `Accept: application/pdf`. For CSV export use `Accept: text/csv`.

### 1.2 Path / environment variables

| Variable      | Description                          | Example                  |
| ------------- | ------------------------------------ | ------------------------ |
| `base_url`    | API origin                           | `http://localhost:8000`  |
| `token`       | Sanctum bearer token                 | `1\|abcdef...`           |
| `project_id`  | Project ID (path scope)              | `1`                      |
| `account_id`  | Social media account ID              | `1`                      |
| `post_id`     | Post ID                              | `1`                      |

### 1.3 Supported platforms

`instagram`, `twitter` (X), `linkedin`, `youtube`, `snapchat`, `tiktok`, `facebook`.

### 1.4 Standard response envelope

All JSON endpoints return a Laravel-style envelope:

```json
{
  "data": { /* resource or list */ },
  "message": "OK",
  "status": 200
}
```

Errors use HTTP status + `{ "message": "...", "errors": { "field": ["..."] } }`.

---

## 2. Recommended frontend setup (Next.js / fetch)

```ts
// src/lib/social-api.ts
const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export async function api<T>(
  path: string,
  init: RequestInit & { token: string } = { token: "" }
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${init.token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
```

---

## 3. Endpoints

### 3.1 Dashboard

#### `GET /projects/{project_id}/social-media`

Get the project's social media dashboard (aggregated KPIs across all accounts).

| Param       | In    | Type     | Required | Notes                |
| ----------- | ----- | -------- | -------- | -------------------- |
| `project_id`| path  | integer  | ✅       |                      |
| `per_page`  | query | integer  | ❌       | default `20`         |

**Example**
```http
GET {{base_url}}/api/v1/projects/1/social-media?per_page=20
```

---

### 3.2 Accounts

All routes are scoped under `/projects/{project_id}/social-media`.

#### `GET /accounts` — List accounts
Returns all connected social media accounts for the project.

#### `GET /accounts/{account_id}` — Get account details
Returns single account with statistics and demographics.

#### `POST /manual-accounts` — Create manual account
Creates an account whose data is entered manually (no API integration). Body is platform-aware via `platform` field.

**Common body fields**

| Field                | Type    | Required | Notes                                    |
| -------------------- | ------- | -------- | ---------------------------------------- |
| `platform`           | string  | ✅       | one of supported platforms                |
| `account_name`       | string  | ✅       |                                          |
| `account_url`        | string  | ✅       | full profile URL                          |
| `followers_count`    | integer | ❌       |                                          |
| `following_count`    | integer | ❌       |                                          |
| `posts_count`        | integer | ❌       |                                          |
| `total_reach`        | integer | ❌       |                                          |
| `total_impressions`  | integer | ❌       |                                          |
| `total_views`        | integer | ❌       | video-first platforms                     |
| `total_likes`        | integer | ❌       |                                          |
| `total_comments`     | integer | ❌       |                                          |
| `total_shares`       | integer | ❌       |                                          |
| `engagement_rate`    | float   | ❌       | %                                        |
| `growth_rate`        | float   | ❌       | %                                        |
| `platform_specific`  | object  | ❌       | platform-dependent — see §5               |
| `demographics`       | object  | ❌       | see §6                                   |
| `posts`              | array   | ❌       | optional initial posts (Instagram sample) |

<details>
<summary><strong>Instagram body example</strong></summary>

```json
{
  "platform": "instagram",
  "account_name": "riyadh_chamber",
  "account_url": "https://instagram.com/riyadh_chamber",
  "followers_count": 50000,
  "following_count": 300,
  "posts_count": 450,
  "total_reach": 180000,
  "total_impressions": 250000,
  "total_views": 300000,
  "total_likes": 10000,
  "total_comments": 1500,
  "total_shares": 1000,
  "engagement_rate": 2.5,
  "growth_rate": 3.2,
  "platform_specific": {
    "saves": 800,
    "profile_visits": 2000,
    "link_clicks": 350
  },
  "demographics": {
    "gender": { "male": 55, "female": 43, "other": 2 },
    "age_groups": { "18-24": 30, "25-34": 35, "35-44": 20, "45-54": 10, "55+": 5 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 70 },
      { "name": "UAE", "code": "AE", "percentage": 12 },
      { "name": "Kuwait", "code": "KW", "percentage": 8 },
      { "name": "Bahrain", "code": "BH", "percentage": 5 },
      { "name": "Egypt", "code": "EG", "percentage": 5 }
    ],
    "devices": { "mobile": 78, "desktop": 15, "tablet": 7 }
  },
  "posts": [
    {
      "title": "First Post",
      "published_at": "2026-04-01T10:00:00Z",
      "content": "محتوى المنشور الأول",
      "post_url": "https://instagram.com/p/abc123",
      "impressions": 15000,
      "reach": 12000,
      "likes": 800,
      "comments": 120,
      "shares": 50,
      "views": 20000,
      "platform_specific": { "saves": 90, "profile_visits": 200 }
    }
  ]
}
```
</details>

<details>
<summary><strong>X / Twitter body example</strong></summary>

```json
{
  "platform": "twitter",
  "account_name": "riyadh_chamber_x",
  "account_url": "https://x.com/riyadh_chamber",
  "followers_count": 120000,
  "following_count": 500,
  "posts_count": 1200,
  "total_reach": 400000,
  "total_impressions": 600000,
  "total_likes": 25000,
  "total_comments": 3000,
  "total_shares": 8000,
  "engagement_rate": 3.0,
  "growth_rate": 2.5,
  "platform_specific": { "quotes_count": 1200, "bookmarks": 4500 },
  "demographics": {
    "gender": { "male": 68, "female": 30, "other": 2 },
    "age_groups": { "18-24": 20, "25-34": 40, "35-44": 25, "45-54": 10, "55+": 5 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 65 },
      { "name": "UAE", "code": "AE", "percentage": 15 },
      { "name": "Kuwait", "code": "KW", "percentage": 10 }
    ],
    "devices": { "mobile": 72, "desktop": 22, "tablet": 6 }
  }
}
```
</details>

<details>
<summary><strong>LinkedIn body example</strong></summary>

```json
{
  "platform": "linkedin",
  "account_name": "riyadh-chamber",
  "account_url": "https://linkedin.com/company/riyadh-chamber",
  "followers_count": 35000,
  "following_count": 0,
  "posts_count": 200,
  "total_reach": 90000,
  "total_impressions": 150000,
  "total_likes": 4500,
  "total_comments": 600,
  "total_shares": 900,
  "engagement_rate": 1.8,
  "growth_rate": 1.5,
  "platform_specific": { "clicks": 3200, "ctr": 2.13, "page_visits": 8500 },
  "demographics": {
    "gender": { "male": 72, "female": 27, "other": 1 },
    "age_groups": { "18-24": 10, "25-34": 38, "35-44": 32, "45-54": 15, "55+": 5 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 60 },
      { "name": "UAE", "code": "AE", "percentage": 18 },
      { "name": "Kuwait", "code": "KW", "percentage": 10 }
    ],
    "devices": { "mobile": 55, "desktop": 40, "tablet": 5 }
  }
}
```
</details>

<details>
<summary><strong>YouTube body example</strong></summary>

```json
{
  "platform": "youtube",
  "account_name": "RiyadhChamber",
  "account_url": "https://youtube.com/@RiyadhChamber",
  "followers_count": 80000,
  "following_count": 0,
  "posts_count": 350,
  "total_reach": 500000,
  "total_impressions": 800000,
  "total_views": 1200000,
  "total_likes": 35000,
  "total_comments": 4000,
  "total_shares": 6000,
  "engagement_rate": 2.2,
  "growth_rate": 4.0,
  "platform_specific": {
    "watch_time_hours": 85000,
    "subscribers_gained": 1200,
    "like_ratio": 96.5,
    "traffic_sources": {
      "youtube_search": 40,
      "suggested_videos": 30,
      "external": 15,
      "direct": 10,
      "other": 5
    }
  },
  "demographics": {
    "gender": { "male": 62, "female": 36, "other": 2 },
    "age_groups": { "18-24": 25, "25-34": 38, "35-44": 22, "45-54": 10, "55+": 5 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 68 },
      { "name": "UAE", "code": "AE", "percentage": 14 },
      { "name": "Kuwait", "code": "KW", "percentage": 8 }
    ],
    "devices": { "mobile": 65, "desktop": 28, "tablet": 7 }
  }
}
```
</details>

<details>
<summary><strong>Snapchat body example</strong></summary>

```json
{
  "platform": "snapchat",
  "account_name": "riyadh.chamber",
  "account_url": "https://snapchat.com/add/riyadh.chamber",
  "followers_count": 25000,
  "following_count": 0,
  "posts_count": 180,
  "total_reach": 60000,
  "total_impressions": 95000,
  "total_views": 200000,
  "total_likes": 0,
  "total_comments": 0,
  "total_shares": 0,
  "engagement_rate": 1.2,
  "growth_rate": 2.0,
  "platform_specific": {
    "screenshots": 3500,
    "story_completions": 8000,
    "unique_views": 18000,
    "story_completion_rate": 68.5
  },
  "demographics": {
    "gender": { "male": 50, "female": 48, "other": 2 },
    "age_groups": { "18-24": 45, "25-34": 35, "35-44": 12, "45-54": 5, "55+": 3 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 75 },
      { "name": "UAE", "code": "AE", "percentage": 12 },
      { "name": "Kuwait", "code": "KW", "percentage": 8 }
    ],
    "devices": { "mobile": 98, "desktop": 1, "tablet": 1 }
  }
}
```
</details>

<details>
<summary><strong>TikTok body example</strong></summary>

```json
{
  "platform": "tiktok",
  "account_name": "riyadhchamber",
  "account_url": "https://tiktok.com/@riyadhchamber",
  "followers_count": 90000,
  "following_count": 50,
  "posts_count": 420,
  "total_reach": 750000,
  "total_impressions": 1200000,
  "total_views": 2000000,
  "total_likes": 180000,
  "total_comments": 12000,
  "total_shares": 25000,
  "engagement_rate": 5.5,
  "growth_rate": 8.0,
  "platform_specific": {
    "profile_visits": 15000,
    "follows_from_video": 3500,
    "total_play_time": 4200
  },
  "demographics": {
    "gender": { "male": 48, "female": 50, "other": 2 },
    "age_groups": { "18-24": 42, "25-34": 32, "35-44": 15, "45-54": 7, "55+": 4 },
    "top_countries": [
      { "name": "Saudi Arabia", "code": "SA", "percentage": 72 },
      { "name": "UAE", "code": "AE", "percentage": 14 },
      { "name": "Kuwait", "code": "KW", "percentage": 7 }
    ],
    "devices": { "mobile": 95, "desktop": 3, "tablet": 2 }
  }
}
```
</details>

#### `POST /accounts/{account_id}/manual-statistics` — Update statistics + demographics
Replaces the manual numbers and demographics for an account. Same shape as create body **without** `platform` (account is already known).

#### `DELETE /accounts/{account_id}` — Disconnect account
Removes the account and its statistics from the project.

#### `POST /accounts/sync` — Sync accounts (API-connected only)
Pulls fresh account-level data from the platform's API. No body.

#### `POST /accounts/refresh` — Refresh statistics
Recomputes aggregated statistics across all accounts in the project. No body.

#### `POST /accounts/verify` — Verify credentials
Validates that the supplied credentials work before connecting an API account.

```json
{
  "platform": "twitter",
  "credentials": {
    "api_key": "YOUR_API_KEY",
    "api_secret": "YOUR_API_SECRET",
    "access_token": "YOUR_ACCESS_TOKEN",
    "access_token_secret": "YOUR_ACCESS_TOKEN_SECRET"
  }
}
```

---

### 3.3 Posts

#### `GET /posts` — List posts
List all posts in the project.

#### `POST /accounts/{account_id}/manual-posts` — Add manual post
Adds a manually-entered post. Common body:

| Field               | Type    | Required | Notes                                     |
| ------------------- | ------- | -------- | ----------------------------------------- |
| `title`             | string  | ✅       |                                           |
| `published_at`      | ISO8601 | ✅       | UTC timestamp                              |
| `content`           | string  | ❌       |                                           |
| `post_url`          | string  | ❌       | omit for Snapchat stories                  |
| `impressions`       | integer | ❌       |                                           |
| `reach`             | integer | ❌       |                                           |
| `likes`             | integer | ❌       |                                           |
| `comments`          | integer | ❌       |                                           |
| `shares`            | integer | ❌       |                                           |
| `views`             | integer | ❌       |                                           |
| `platform_specific` | object  | ❌       | shape determined by parent account platform |

<details>
<summary><strong>Instagram post body</strong></summary>

```json
{
  "title": "منشور يوم التأسيس",
  "published_at": "2026-02-22T08:00:00Z",
  "content": "نحتفل معكم بيوم التأسيس السعودي #يوم_التأسيس",
  "post_url": "https://instagram.com/p/xyz789",
  "impressions": 25000,
  "reach": 18000,
  "likes": 1500,
  "comments": 230,
  "shares": 180,
  "views": 32000,
  "platform_specific": { "saves": 320, "profile_visits": 450 }
}
```
</details>

<details>
<summary><strong>YouTube post body</strong></summary>

```json
{
  "title": "فيديو ملتقى الأعمال السنوي",
  "published_at": "2026-03-15T14:00:00Z",
  "content": "نقدم لكم تغطية شاملة لملتقى الأعمال السنوي",
  "post_url": "https://youtube.com/watch?v=abc123",
  "impressions": 80000,
  "reach": 65000,
  "likes": 3200,
  "comments": 480,
  "shares": 620,
  "views": 120000,
  "platform_specific": { "watch_time_minutes": 45000 }
}
```
</details>

<details>
<summary><strong>TikTok post body</strong></summary>

```json
{
  "title": "فيديو قصير عن خدمات الغرفة",
  "published_at": "2026-04-10T18:00:00Z",
  "content": "تعرف على خدمات غرفة الرياض في 60 ثانية",
  "post_url": "https://tiktok.com/@riyadhchamber/video/123",
  "impressions": 150000,
  "reach": 120000,
  "likes": 18000,
  "comments": 2200,
  "shares": 4500,
  "views": 200000,
  "platform_specific": { "profile_visits": 3200, "follows_from_video": 850 }
}
```
</details>

<details>
<summary><strong>Snapchat post body</strong></summary>

```json
{
  "title": "قصة يوم التأسيس",
  "published_at": "2026-02-22T09:00:00Z",
  "content": "قصة احتفالية بيوم التأسيس",
  "impressions": 18000,
  "reach": 15000,
  "views": 14000,
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "platform_specific": { "screenshots": 420, "story_completions": 9500 }
}
```
</details>

#### `PUT /posts/{post_id}` — Update post
```json
{
  "title": "عنوان محدّث",
  "content": "محتوى محدّث للمنشور",
  "post_url": "https://instagram.com/p/abc123"
}
```

#### `POST /posts/sync` — Sync posts from API account
```json
{ "account_id": 1 }
```

#### `DELETE /accounts/{account_id}/posts/{post_id}` — Delete post

---

### 3.4 Reports

All report endpoints accept the same query params:

| Param   | Type   | Required | Notes                                                    |
| ------- | ------ | -------- | -------------------------------------------------------- |
| `preset`| string | ❌       | `day` \| `week` \| `month` \| `quarter` \| `year`         |
| `from`  | date   | ❌       | `YYYY-MM-DD` (use with `to` for custom range)             |
| `to`    | date   | ❌       | `YYYY-MM-DD`                                              |

#### `GET /report?preset=month` — Full report (JSON)
Returns aggregated metrics for the selected period.

#### `GET /report/pdf?preset=month` — Export PDF
Returns `application/pdf`. From the frontend, fetch as `blob` and create a download link:
```ts
const res = await fetch(url, { headers: { Accept: "application/pdf", Authorization: `Bearer ${token}` } });
const blob = await res.blob();
window.open(URL.createObjectURL(blob));
```

#### `GET /report/csv?preset=month` — Export CSV
Returns `text/csv`. Same blob-download pattern with `Accept: text/csv`.

---

## 4. Endpoint summary table

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET    | `/projects/{project_id}/social-media`                                          | Dashboard |
| 2 | GET    | `/projects/{project_id}/social-media/accounts`                                 | List accounts |
| 3 | GET    | `/projects/{project_id}/social-media/accounts/{account_id}`                    | Account details |
| 4 | POST   | `/projects/{project_id}/social-media/manual-accounts`                          | Create manual account |
| 5 | POST   | `/projects/{project_id}/social-media/accounts/{account_id}/manual-statistics`  | Update stats + demographics |
| 6 | DELETE | `/projects/{project_id}/social-media/accounts/{account_id}`                    | Disconnect account |
| 7 | POST   | `/projects/{project_id}/social-media/accounts/sync`                            | Sync API accounts |
| 8 | POST   | `/projects/{project_id}/social-media/accounts/refresh`                         | Refresh statistics |
| 9 | POST   | `/projects/{project_id}/social-media/accounts/verify`                          | Verify credentials |
| 10 | GET   | `/projects/{project_id}/social-media/posts`                                    | List posts |
| 11 | POST  | `/projects/{project_id}/social-media/accounts/{account_id}/manual-posts`       | Add manual post |
| 12 | PUT   | `/projects/{project_id}/social-media/posts/{post_id}`                          | Update post |
| 13 | POST  | `/projects/{project_id}/social-media/posts/sync`                               | Sync posts (API) |
| 14 | DELETE| `/projects/{project_id}/social-media/accounts/{account_id}/posts/{post_id}`    | Delete post |
| 15 | GET   | `/projects/{project_id}/social-media/report?preset=...`                        | Full report (JSON) |
| 16 | GET   | `/projects/{project_id}/social-media/report/pdf?preset=...`                    | Export PDF |
| 17 | GET   | `/projects/{project_id}/social-media/report/csv?preset=...`                    | Export CSV |

---

## 5. `platform_specific` field reference

All keys are optional. Send only what you have.

### 🐦 Twitter / X
```json
{ "quotes_count": 1200, "bookmarks": 4500 }
```

### 📸 Instagram
```json
{ "saves": 800, "profile_visits": 2000, "link_clicks": 350 }
```

### 💼 LinkedIn
```json
{ "clicks": 3200, "ctr": 2.13, "page_visits": 8500 }
```

### ▶️ YouTube
```json
{
  "watch_time_hours": 85000,
  "subscribers_gained": 1200,
  "like_ratio": 96.5,
  "traffic_sources": {
    "youtube_search": 40,
    "suggested_videos": 30,
    "external": 15,
    "direct": 10,
    "other": 5
  }
}
```

### 👻 Snapchat
```json
{
  "screenshots": 3500,
  "story_completions": 8000,
  "unique_views": 18000,
  "story_completion_rate": 68.5
}
```

### 🎵 TikTok
```json
{ "profile_visits": 15000, "follows_from_video": 3500, "total_play_time": 4200 }
```

### 👍 Facebook
```json
{
  "clicks": 2500,
  "reactions_love": 800,
  "reactions_haha": 200,
  "reactions_wow": 150,
  "reactions_sad": 50,
  "reactions_angry": 10
}
```

---

## 6. `demographics` structure

All percentages are numbers in `0–100`. Demographics are always attached to **account-level** statistics (not posts).

```json
{
  "gender": {
    "male": 55,
    "female": 43,
    "other": 2
  },
  "age_groups": {
    "18-24": 30,
    "25-34": 35,
    "35-44": 20,
    "45-54": 10,
    "55+": 5
  },
  "top_countries": [
    { "name": "Saudi Arabia", "code": "SA", "percentage": 70 },
    { "name": "UAE",          "code": "AE", "percentage": 12 },
    { "name": "Kuwait",       "code": "KW", "percentage": 8  },
    { "name": "Bahrain",      "code": "BH", "percentage": 5  },
    { "name": "Egypt",        "code": "EG", "percentage": 5  }
  ],
  "devices": {
    "mobile": 78,
    "desktop": 15,
    "tablet": 7
  }
}
```

**Notes**
- All fields are optional (nullable).
- `top_countries`: max **10** entries.
- `code` is ISO 3166-1 alpha-2 (`SA`, `AE`, `US`, ...).
- Percentages don't have to sum to 100 — some platforms don't report all segments.

---

## 7. TypeScript types (drop-in)

```ts
export type Platform =
  | "instagram" | "twitter" | "linkedin"
  | "youtube"   | "snapchat" | "tiktok" | "facebook";

export interface Demographics {
  gender?: { male?: number; female?: number; other?: number };
  age_groups?: Record<"18-24" | "25-34" | "35-44" | "45-54" | "55+", number>;
  top_countries?: { name: string; code: string; percentage: number }[];
  devices?: { mobile?: number; desktop?: number; tablet?: number };
}

export interface ManualAccountInput {
  platform: Platform;
  account_name: string;
  account_url: string;
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
  platform_specific?: Record<string, unknown>;
  demographics?: Demographics;
  posts?: ManualPostInput[];
}

export interface ManualPostInput {
  title: string;
  published_at: string; // ISO 8601
  content?: string;
  post_url?: string;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  platform_specific?: Record<string, unknown>;
}

export interface VerifyCredentialsInput {
  platform: Platform;
  credentials: Record<string, string>;
}

export type ReportPreset = "day" | "week" | "month" | "quarter" | "year";
```

---

## 8. Quick integration checklist

- [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`.
- [ ] Store the Sanctum token after login (httpOnly cookie preferred over `localStorage`).
- [ ] Wrap fetch calls with the helper in §2 to inject auth + JSON headers.
- [ ] Use `Accept: application/pdf` / `text/csv` for the two export endpoints and download via `Blob`.
- [ ] Validate forms client-side against §5 / §6 shapes before posting.
- [ ] Handle `401` (token expired) by redirecting to login; handle `422` by surfacing `errors` per field.
