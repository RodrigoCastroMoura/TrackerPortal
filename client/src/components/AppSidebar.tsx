import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  TestTube2,
  Shield,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface AppSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AppSidebar({ userRole = "user", userName = "Usuário" }: AppSidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();

  const adminItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Veículos",
      url: "/veiculos",
      icon: Car,
    },
    {
      title: "Rastreamento",
      url: "/rastreamento",
      icon: MapPin,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: Shield,
      adminOnly: true,
    },
    {
      title: "Teste de Rastreador",
      url: "/teste",
      icon: TestTube2,
    },
  ];

  const items = adminItems.filter(item => !item.adminOnly || userRole === "admin");

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Portal Rastreamento</h2>
            <p className="text-xs text-muted-foreground">Central de Controle</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{userName}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {userRole === "admin" ? "Admin" : "Técnico"}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            data-testid="button-logout"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
