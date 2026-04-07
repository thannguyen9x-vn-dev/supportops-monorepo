# Auth Cookie Contract (Frontend <-> Backend)

This document defines the backend behavior required by the frontend for refresh-token flow.

## API Prefix
- Base path: `/api/v1`

## Token Transport Strategy
- `accessToken`: returned in response body, used by frontend in `Authorization: Bearer ...`.
- `refreshToken`: stored only in `HttpOnly` cookie, never exposed to JavaScript.

## Required Endpoints

### `POST /api/v1/auth/login`
- Request body:
```json
{ "email": "user@example.com", "password": "..." }
```
- Success response body:
```json
{
  "data": {
    "accessToken": "...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "...",
      "lastName": "...",
      "avatarUrl": null,
      "role": "MEMBER",
      "tenantId": "uuid",
      "tenantName": "..."
    }
  }
}
```
- Must set refresh cookie with `Set-Cookie`.

### `POST /api/v1/auth/register`
- Success behavior same as login: return `accessToken` in body + set refresh cookie.

### `POST /api/v1/auth/refresh`
- Request body: empty
- Refresh token comes from cookie.
- Success response body:
```json
{ "data": { "accessToken": "...", "expiresIn": 900 } }
```
- Should rotate refresh token and re-set cookie (recommended).

### `POST /api/v1/auth/logout`
- Must invalidate refresh token server-side.
- Must clear cookie:
  - same cookie name/path/domain as issue cookie
  - `Max-Age=0` (or past `Expires`)

## Cookie Spec (Required)
- Name: `supportops_refresh_token`
- `HttpOnly`: `true`
- `Secure`: `true` in production, can be `false` for local HTTP
- `SameSite`: `Lax` (recommended default)
- `Path`: `/`
- `Max-Age`: `604800` (7 days)

## CORS Requirements (when FE and BE are cross-origin)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin`: explicit frontend origin (not `*`)

## Error Contract
- All errors must follow:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "...",
    "details": [],
    "traceId": "uuid"
  }
}
```

## FE Assumptions Already Implemented
- All requests send `credentials: include`.
- Refresh flow is automatic on `401`.
- Frontend does not read or write refresh token anywhere.
