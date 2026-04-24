# Phase 1: Foundation & Authentication — Learning Notes (for Laravel Devs)

If you are coming from Laravel, Next.js (specifically the modern "App Router") introduces some new paradigms, but many concepts map directly to things you already know. Here is a breakdown of how our Phase 1 code works, translated into Laravel concepts.

---

## 1. Routing: `routes/web.php` vs. File-System Routing

**In Laravel:**
You explicitly define routes in `routes/web.php`:
```php
Route::get('/', [HomeController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);
```

**In Next.js:**
Routes are defined automatically by the folder structure inside the `app/` directory. The file named `page.tsx` is the entry point for that route.
* `app/page.tsx` becomes the `/` route.
* `app/dashboard/page.tsx` becomes the `/dashboard` route.

---

## 2. Logic & Views: Controllers + Blade vs. Server Components

**In Laravel:**
A Controller fetches data and passes it to a Blade view.
```php
// DashboardController.php
public function index() {
    $user = Auth::user();
    return view('dashboard', ['user' => $user]);
}
```

**In Next.js:**
Next.js uses **React Server Components (RSC)**. These components run *only on the server*, meaning they act as both the Controller and the View. You can write backend logic (like fetching from a database or checking auth) directly inside the component.

In our `app/dashboard/page.tsx`, we do this:
```tsx
// This runs on the server!
export default async function Dashboard() {
  // 1. "Controller" logic: Get the user
  const { userId } = await auth(); 
  const user = await currentUser();

  // 2. "View" logic: Return the HTML (JSX)
  return (
    <div>
      <h1>Welcome {user.firstName}</h1>
    </div>
  );
}
```

---

## 3. Layouts: `@extends` vs. `layout.tsx`

**In Laravel:**
You create a master `app.blade.php` with `@yield('content')`, and child views use `@extends('layouts.app')`.

**In Next.js:**
You use `layout.tsx`. Any `page.tsx` inside the same folder (or subfolders) is automatically injected into the `layout.tsx` as the `children` prop.

In our `app/layout.tsx`:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* The 'children' here acts exactly like @yield('content') */}
        <body>{children}</body> 
      </html>
    </ClerkProvider>
  );
}
```
Because this is in the root `app/` folder, it wraps every single page in the application, ensuring Clerk Authentication is available globally.

---

## 4. Route Protection: `Http/Middleware` vs. `middleware.ts`

**In Laravel:**
You protect routes using middleware, often grouped in `routes/web.php` or `app/Http/Kernel.php`.
```php
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', ...);
});
```

**In Next.js:**
A single file named `middleware.ts` at the root of the project intercepts *all* incoming requests before they hit your pages. 

In our `middleware.ts`:
```typescript
// 1. Define which routes need protection (like a Route Group in Laravel)
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user hits a protected route, force them to log in
  if (isProtectedRoute(req)) {
    await auth.protect(); 
  }
});
```

---

## 5. Authentication: Built-in Auth vs. Clerk

**In Laravel:**
You might use Laravel Breeze or Jetstream. It sets up database tables (`users`), handles hashing passwords, and manages session cookies.

**In Next.js:**
Instead of building auth from scratch, modern React stacks often use Auth-as-a-Service providers like **Clerk**.
* We don't need a `users` table for passwords.
* Clerk handles the login UI (the `<SignInButton />` and `<UserButton />`).
* Clerk manages the secure HTTP-only cookies and JWT tokens automatically.
* To check if someone is logged in, we simply call `await auth()` on the server. If it returns a `userId`, they are authenticated.

---

## Summary of How Phase 1 Works

1. A user visits `http://localhost:3000/dashboard`.
2. The `middleware.ts` intercepts the request. It sees `/dashboard` matches the protected routes.
3. Middleware checks Clerk for a valid session cookie.
4. If **no cookie**, Clerk redirects the user to the login modal.
5. If **cookie is valid**, Next.js executes `app/dashboard/page.tsx` on the server.
6. The Server Component calls `await currentUser()` to get the user's name and email from Clerk's backend.
7. Next.js generates the final HTML and sends it to the browser.
8. The browser displays the Dashboard.
