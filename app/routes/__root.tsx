import {
  Navigate,
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-start";
import React, { Suspense } from "react";
import appCss from "../styles/index.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Repostería De las Artes',
      },
      { name: 'description', content: 'Repostería de las Artes' },
      {
        name: 'og:image',
        content:
          'https://farm2.staticflickr.com/1723/42396655401_7355bbdf7f_z.jpg',
      },
      { name: 'og:url', content: 'https://delasartes.com.ar' },
      { name: 'og:type', content: 'product' },
      { name: 'og:title', content: 'De las Artes' },
      { name: 'og:description', content: 'Pastelería Artesanal' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: 'favicon.ico' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" />,
});

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <Meta />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  );
}
