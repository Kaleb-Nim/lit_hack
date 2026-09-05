import { redirect } from "next/navigation";

export default function FilesPage() {
  redirect("/contracts?regulation=PDPA2012");
}
