"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";

const members = [
  {
    id: 1,
    name: "Pontus Abrahamsson",
    email: "pontus@lostisland.co",
    role: "Owner",
    avatar: "/placeholder.svg",
  },
];

export default function TeamManagement() {
  return (
    <div className="w-full space-y-4 p-8">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="members"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-2"
          >
            Team Members
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-2"
          >
            Pending Invitations
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Filter..."
              className="pl-9 bg-transparent border-border"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border-border"
              >
                All Team Roles
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Owner</DropdownMenuItem>
              <DropdownMenuItem>Admin</DropdownMenuItem>
              <DropdownMenuItem>Member</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border-border"
              >
                Date
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Oldest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="members" className="mt-4">
          <div className="border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <Checkbox className="border-border" />
                <span className="text-sm text-secondary">Select all (1)</span>
                <div className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center gap-4">
                <Checkbox className="border-border" />
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{member.name}</div>
                    <div className="text-xs text-secondary">{member.email}</div>
                  </div>
                </div>
                <div className="text-sm text-secondary">{member.role}</div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="border border-border p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
            <h3 className="text-md mb-2 text-sm">
              No Pending Invitations Found
            </h3>
            <p className="text-secondary text-xs">
              Use the form above to invite a Team Member.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
