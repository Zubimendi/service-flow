"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServices, useCreateService, useDeleteService } from "@/hooks/use-services";
import { serviceSchema, ServiceInput } from "@/lib/validations/service";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

interface ServicesManagerProps {
  slug: string;
}

export function ServicesManager({ slug }: ServicesManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useServices(slug);
  const createService = useCreateService(slug);
  const deleteService = useDeleteService(slug);

  const { data: staffData } = useQuery({
    queryKey: ["staff", slug],
    queryFn: () => api.get<{ staff: Array<{ id: string; name: string }> }>(`/api/tenants/${slug}/staff`),
  });

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      durationMinutes: 60,
      price: 0,
      assignedStaffIds: [],
    },
  });

  const onSubmit = async (values: ServiceInput) => {
    await createService.mutateAsync({
      ...values,
      price: Math.round(values.price * 100),
    });
    form.reset();
    setShowForm(false);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  const services = data?.services ?? [];
  const staff = staffData?.staff ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Services</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" {...form.register("durationMinutes", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register("description")} />
              </div>
              <div className="space-y-2">
                <Label>Assigned Staff</Label>
                <div className="flex flex-wrap gap-2">
                  {staff.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        value={s.id}
                        checked={form.watch("assignedStaffIds")?.includes(s.id)}
                        onChange={(e) => {
                          const current = form.getValues("assignedStaffIds") ?? [];
                          if (e.target.checked) {
                            form.setValue("assignedStaffIds", [...current, s.id]);
                          } else {
                            form.setValue(
                              "assignedStaffIds",
                              current.filter((id) => id !== s.id)
                            );
                          }
                        }}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createService.isPending}>
                  Save Service
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service to start accepting bookings."
          actionLabel="Add Service"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.filter((s) => s.isActive).map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {service.description && (
                  <p className="text-caption">{service.description}</p>
                )}
                <p className="text-sm">
                  {service.durationMinutes} min · {formatCurrency(service.price)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteService.mutate(service.id)}
                >
                  Deactivate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
