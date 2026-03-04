# ARIA Changes — `gnomex_ng/src/app/services`

**Date:** 2026-03-04
**Scope:** All 66 files under `src/app/services` (including subdirectories)

---

## Summary

All files in this directory were reviewed for ARIA accessibility opportunities.

**Angular Services, Resolvers, Interceptors, and Route Guards (65 `.ts` files + `services.module.ts`)**
None of these files contain Angular `@Component` decorators and therefore have no HTML templates — no ARIA attributes apply to them. They are pure `@Injectable` services, HTTP interceptors, route resolvers, route guards, and a module definition file.

**`Duo-Web-v2.js` (1 file)**
This is the Duo Security two-factor authentication SDK. It dynamically creates DOM elements via JavaScript. A missing `title` attribute on the generated `<iframe>` was identified and corrected — screen readers require an iframe `title` to announce its purpose.

**Files modified: 1**
**Files with no changes needed: 65**

---

## File Modified

### `Duo-Web-v2.js`

**Issue:** The `ready()` function creates an `<iframe>` to embed the Duo Security authentication prompt in two code paths. Neither path guaranteed a `title` attribute on the iframe, making it inaccessible to screen reader users (WCAG 2.1 Success Criterion 4.1.2 — Name, Role, Value; also Technique H64).

**Changes made:**

1. **`isIframe` branch** (when the caller passes an existing `<iframe>` element as `promptElement`):
   Added a guard that sets `iframe.title = 'Duo Security Authentication'` if the element has no title already. This preserves any caller-supplied title while providing an accessible default.

   ```javascript
   // Ensure the iframe has an accessible title for screen readers
   if (!iframe.title) {
       iframe.title = 'Duo Security Authentication';
   }
   ```

2. **`createElement` branch** (when the caller passes a container element and a new `<iframe>` is created):
   Added a guard that injects `title: 'Duo Security Authentication'` into `iframeAttributes` before the attribute loop runs, so the title is set via `iframe.setAttribute()` together with all other caller-supplied attributes. Callers can still override it by including their own `title` key in `iframeAttributes`.

   ```javascript
   // Ensure a title attribute is present for screen-reader accessibility.
   if (!iframeAttributes['title']) {
       iframeAttributes['title'] = 'Duo Security Authentication';
   }
   ```

---

## Files Reviewed — No Changes Needed

### Root services (49 `.ts` files)

These are all `@Injectable` Angular services with no HTML templates.

| File | Reason — no ARIA change needed |
|------|-------------------------------|
| `account-fields-configuration.service.ts` | `@Injectable` service — no HTML template |
| `amend-experiment.service.ts` | `@Injectable` service — no HTML template |
| `analysis.service.ts` | `@Injectable` service — no HTML template |
| `annotation.service.ts` | `@Injectable` service — no HTML template |
| `app-user-list.service.ts` | `@Injectable` service — no HTML template |
| `app-user-public.service.ts` | `@Injectable` service — no HTML template |
| `billing.service.ts` | `@Injectable` service — no HTML template (`template` appears only as a method parameter name) |
| `billingPOForm.service.ts` | `@Injectable` service — no HTML template |
| `broadcast-email.service.ts` | `@Injectable` service — no HTML template |
| `browse-order-validate.service.ts` | `@Injectable` service — no HTML template |
| `check-session-status.service.ts` | `@Injectable` service — no HTML template |
| `configuration.service.ts` | `@Injectable` service — no HTML template |
| `constants.service.ts` | `@Injectable` service — no HTML template (`.html` appears only in a file-extensions array constant) |
| `cookie-util.service.ts` | `@Injectable` service — no HTML template |
| `CORE-linkage.service.ts` | `@Injectable` service — no HTML template |
| `create-security-advisor.service.ts` | `@Injectable` service — no HTML template |
| `data-track.service.ts` | `@Injectable` service — no HTML template |
| `dictionary.service.ts` | `@Injectable` service — no HTML template |
| `experiment-platform.service.ts` | `@Injectable` service — no HTML template |
| `experiment-view.service.ts` | `@Injectable` service — no HTML template |
| `file.service.ts` | `@Injectable` service — no HTML template |
| `genome-build-validate.service.ts` | `@Injectable` service — no HTML template |
| `get-lab.service.ts` | `@Injectable` service — no HTML template |
| `gnomex-string-util.service.ts` | `@Injectable` service — no HTML template |
| `gnomex.service.ts` | `@Injectable` service — no HTML template |
| `grid-column-validate.service.ts` | `@Injectable` service — no HTML template |
| `lab-list.service.ts` | `@Injectable` service — no HTML template |
| `lab-membership-request.service.ts` | `@Injectable` service — no HTML template |
| `launch-properites.service.ts` | `@Injectable` service — no HTML template |
| `navigation.service.ts` | `@Injectable` service — no HTML template |
| `new-billing-account.service.ts` | `@Injectable` service — no HTML template |
| `new-experiment.service.ts` | `@Injectable` service — no HTML template |
| `organism.service.ts` | `@Injectable` service — no HTML template |
| `password-util.service.ts` | `@Injectable` service — no HTML template |
| `products.service.ts` | `@Injectable` service — no HTML template |
| `project.service.ts` | `@Injectable` service — no HTML template |
| `property.service.ts` | `@Injectable` service — no HTML template |
| `protocol.service.ts` | `@Injectable` service — no HTML template |
| `report-issue.service.ts` | `@Injectable` service — no HTML template |
| `services.module.ts` | `@NgModule` — no HTML template |
| `topic.service.ts` | `@Injectable` service — no HTML template |
| `unique-id-generator.service.ts` | `@Injectable` service — no HTML template |
| `upload-file.service.ts` | `@Injectable` service — no HTML template |
| `usage.service.ts` | `@Injectable` service — no HTML template |
| `user-preferences.service.ts` | `@Injectable` service — no HTML template |
| `user.service.ts` | `@Injectable` service — no HTML template |
| `util.service.ts` | `@Injectable` service — no HTML template |
| `window.service.ts` | `@Injectable` service — no HTML template |
| `workflow.service.ts` | `@Injectable` service — no HTML template |

### `interceptors/` (2 files)

| File | Reason — no ARIA change needed |
|------|-------------------------------|
| `interceptors/error-handler.interceptor.ts` | HTTP interceptor — no HTML template |
| `interceptors/http-uri-encoding-codec.ts` | HTTP codec utility — no HTML template |

### `resolvers/` (12 files)

| File | Reason — no ARIA change needed |
|------|-------------------------------|
| `resolvers/analysis-group-list-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/analysis-group-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/analysis-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/datatrack-list.resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/datatrack-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/experiment-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/genome-build-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/index.ts` | Re-export barrel file — no HTML template |
| `resolvers/lab-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/project-list-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/project-resolver.service.ts` | Route resolver — no HTML template |
| `resolvers/register-user-resolver.service.ts` | Route resolver — no HTML template |

### `route-guards/` (2 files)

| File | Reason — no ARIA change needed |
|------|-------------------------------|
| `route-guards/auth-route-guard.service.ts` | Route guard — no HTML template |
| `route-guards/sub-route-guard.service.ts` | Route guard — no HTML template |

---

## WCAG References

| Criterion | ID | Description |
|-----------|----|-------------|
| Name, Role, Value | 4.1.2 | All UI components must have a name. An `<iframe>` must have a `title` attribute. |
| H64 | Technique | Using the `title` attribute of frame and iframe elements. |
