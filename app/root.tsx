import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css"?url;
import styles from "./styles/app.css"?url;
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { shopify } from "@server/shopify.server";

export const links: LinksFunction = () => ([
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: styles },
]);

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
  { title: "Shopify Marketing Helper" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await shopify.authenticate.admin(request);
  const host = new URL(request.url).searchParams.get("host") ?? "";
  return json({ host });
};

export default function App() {
  const { host } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={enTranslations}>
          <AppBridgeProvider config={{ apiKey: shopify.config.apiKey, host, forceRedirect: true }}>
            <Outlet />
          </AppBridgeProvider>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
