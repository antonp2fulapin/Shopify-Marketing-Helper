import { redirect } from "@remix-run/node";

export const loader = async () => redirect("/dashboard");

export default function Index() {
  return null;
}
