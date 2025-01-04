"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function SelectOrganization() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.organization;
  const { data: organizations } = auth.useListOrganizations();

  if (!organizations) {
    return <Skeleton className="h-5 w-[160px]" />;
  }

  const currentOrg =
    organizations.find((org: { id: string }) => org.id === organizationId) ||
    organizations[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-transparent"
        >
          <span className="uppercase">{currentOrg.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {organizations.map((org: { id: string; name: string }) => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center gap-2"
            onClick={() => router.push(`/${org.id}`)}
          >
            {org.id === currentOrg.id && <Check className="ml-auto" />}
            <span>{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/new-organization")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
