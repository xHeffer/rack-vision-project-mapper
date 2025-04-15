
import { useRackContext } from "@/context/RackContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, HardDrive, Router, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import RackVisualization from "./RackVisualization";

const Dashboard = () => {
  const { devices, racks, selectedRackId } = useRackContext();
  
  // Calculate statistics
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'active').length;
  const warningDevices = devices.filter(d => d.status === 'warning' || d.status === 'error').length;
  
  const devicesByType = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate rack utilization
  const selectedRack = racks.find(rack => rack.id === selectedRackId);
  const occupiedUnits = selectedRack 
    ? selectedRack.units.filter(unit => unit.occupied).length
    : 0;
  const totalUnits = selectedRack ? selectedRack.totalUnits : 0;
  const utilizationPercentage = totalUnits > 0 
    ? Math.round((occupiedUnits / totalUnits) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {racks.length} rack{racks.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-active" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDevices}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeDevices / Math.max(totalDevices, 1)) * 100)}% of total devices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningDevices}</div>
            <p className="text-xs text-muted-foreground">
              {warningDevices} device{warningDevices !== 1 ? 's' : ''} need{warningDevices === 1 ? 's' : ''} attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Device Types */}
      <Card>
        <CardHeader>
          <CardTitle>Device Types</CardTitle>
          <CardDescription>Distribution of devices by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Servers</div>
                <div className="text-xl font-bold">{devicesByType.server || 0}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Switches</div>
                <div className="text-xl font-bold">{devicesByType.switch || 0}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Router className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Routers</div>
                <div className="text-xl font-bold">{devicesByType.router || 0}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Storage</div>
                <div className="text-xl font-bold">{devicesByType.storage || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rack Visualization */}
      <Card className="flex flex-col h-[calc(100vh-380px)] min-h-[500px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rack Visualization</CardTitle>
              <CardDescription>
                {selectedRack ? 
                  `Currently viewing: ${selectedRack.name} (${utilizationPercentage}% utilized)` : 
                  'Select a rack to view'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <div className="h-full p-4">
            <RackVisualization />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
