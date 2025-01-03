"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { Check, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";

export default function SelectOrganization() {
  const params = useParams();
  const organizationId = params.organization;
  const { data: organizations } = auth.useListOrganizations();

  if (!organizations) {
    return <Skeleton className="h-5 w-[160px]" />;
  }

  const currentOrg =
    organizations.find((org) => org.id === organizationId) || organizations[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span>{currentOrg.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} className="flex items-center gap-2">
            {org.id === currentOrg.id && <Check className="ml-auto" />}
            <span>{org.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
