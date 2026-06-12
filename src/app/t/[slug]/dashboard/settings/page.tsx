import { SettingsForm } from "@/features/tenant/components/settings-form";

export default function SettingsPage({ params }: { params: { slug: string } }) {
  return <SettingsForm slug={params.slug} />;
}
