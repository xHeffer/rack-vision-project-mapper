
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader
} from "@/components/ui/sidebar";
import { HardDrive, Server, LayoutDashboard } from "lucide-react";
import RackList from "./RackList";
import { RackProvider } from "@/context/RackContext";

interface AppSidebarProps {
  activeTab: 'dashboard' | 'devices';
  onTabChange: (tab: 'dashboard' | 'devices') => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader className="flex justify-center items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">RackMapper</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col space-y-1 p-2">
          <Button 
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
            className="justify-start"
            onClick={() => onTabChange('dashboard')}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'devices' ? 'default' : 'ghost'} 
            className="justify-start"
            onClick={() => onTabChange('devices')}
          >
            <Server className="mr-2 h-5 w-5" />
            Devices
          </Button>
        </div>
        
        <div className="mt-6">
          <RackList />
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
        <p>RackMapper v1.0</p>
        <p>A server rack mapping tool</p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
