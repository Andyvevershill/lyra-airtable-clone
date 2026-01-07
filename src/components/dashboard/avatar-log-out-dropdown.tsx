"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { signOut } from "@/server/better-auth/client";
import type { User } from "@/types/users";
import { MenubarTrigger } from "@radix-ui/react-menubar";
import { useRouter } from "next/navigation";
import { MdOutlineLogout } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  user: User;
}

export function AvatarLogOutDropdown({ user }: Props) {
  const router = useRouter();
  const handleGoogleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Social logout failed", error);
    }
  };

  return (
    <Menubar className="border-0">
      <MenubarMenu>
        <MenubarTrigger>
          <Avatar className="h-7 w-7 hover:cursor-pointer">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={user.name || ""}
                className="object-cover"
              />
            )}

            <AvatarFallback className="font-medium text-white capitalize">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </MenubarTrigger>
        <MenubarContent
          className="z-1000 mr-3.5 p-5 text-sm md:w-76"
          align="center"
        >
          <div className="height-10 mb-4 ml-2 flex flex-col justify-center gap-2">
            <p>{user.name}</p>
            <p>{user.email}</p>
          </div>
          <MenubarSeparator />
          <MenubarItem
            className="mt-4 hover:cursor-pointer"
            onClick={() => handleGoogleLogout()}
          >
            <MdOutlineLogout /> Log out
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
