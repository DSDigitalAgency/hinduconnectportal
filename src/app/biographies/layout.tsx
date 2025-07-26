"use client";
import React from "react";
import Link from "next/link";

function handleLogout() {
  // Remove the token cookie (client-side only for now)
  document.cookie = 'token=; Max-Age=0; path=/;';
  window.location.href = '/';
}

export default function BiographiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-orange-600 text-white flex flex-col py-8 px-4 justify-between">
        <div>
          <div className="text-2xl font-bold mb-8">Portal Admin</div>
          <ul className="space-y-2">
            <li><Link href="/admin-stotras" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Stotras</Link></li>
            <li><Link href="/admin-temples" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Temples</Link></li>
            <li><Link href="/admin-blogs" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Blogs</Link></li>
            <li><Link href="/admin-videos" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Videos</Link></li>
            <li><Link href="/admin-users" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Users</Link></li>
            <li><Link href="/biographies" className="block py-2 px-4 hover:bg-orange-200 hover:text-orange-900 rounded">Biographies</Link></li>
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="mt-8 w-full py-2 px-4 bg-orange-800 hover:bg-orange-900 text-white rounded font-semibold transition"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 bg-orange-50 min-h-screen">{children}</main>
    </div>
  );
} 