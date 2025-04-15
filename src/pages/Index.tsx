
import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import DeviceList from "@/components/DeviceList";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RackProvider } from "@/context/RackContext";
import { LayoutDashboard, Menu, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <RackProvider>
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider defaultIsOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
          {/* Show sidebar on larger screens */}
          <div className={cn(
            "hidden md:block transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0"
          )}>
            <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          <div className="flex flex-col flex-grow overflow-hidden">
            {/* Top navigation for mobile */}
            <div className="p-4 border-b flex items-center justify-between md:justify-end bg-background">
              <div className="flex items-center md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(prev => !prev)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold ml-2">RackMapper</h1>
              </div>
              
              {/* Mobile tabs */}
              <div className="flex md:hidden space-x-1">
                <Button 
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant={activeTab === 'devices' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setActiveTab('devices')}
                >
                  <Server className="mr-1 h-4 w-4" />
                  Devices
                </Button>
              </div>
            </div>
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="md:hidden fixed inset-0 bg-background/80 z-50">
                <div className="fixed inset-y-0 left-0 w-64">
                  <AppSidebar activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }} />
                </div>
                <div 
                  className="fixed inset-0 bg-background/20"
                  onClick={() => setSidebarOpen(false)}
                />
              </div>
            )}
            
            {/* Main content */}
            <div className="flex-grow overflow-auto p-4 md:p-6">
              {activeTab === 'dashboard' ? <Dashboard /> : <DeviceList />}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </RackProvider>
  );
};

export default Index;
