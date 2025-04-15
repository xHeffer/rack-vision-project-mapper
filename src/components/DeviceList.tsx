
import { useRackContext } from "@/context/RackContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DeviceStatus, DeviceType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Server, Router, Database, Package2, Plus, Search } from "lucide-react";
import DeviceForm from "./DeviceForm";
import AssignDeviceDialog from "./AssignDeviceDialog";

const DeviceTypeIcon = ({ type }: { type: DeviceType }) => {
  switch (type) {
    case 'server':
      return <Server className="h-5 w-5" />;
    case 'router':
      return <Router className="h-5 w-5" />;
    case 'switch':
      return <HardDrive className="h-5 w-5" />;
    case 'storage':
      return <Database className="h-5 w-5" />;
    default:
      return <Package2 className="h-5 w-5" />;
  }
};

const StatusBadge = ({ status }: { status: DeviceStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status) {
    case 'active':
      variant = "default";
      break;
    case 'warning':
      variant = "secondary";
      break;
    case 'error':
      variant = "destructive";
      break;
    case 'inactive':
      variant = "outline";
      break;
  }
  
  return (
    <Badge variant={variant} className={status === 'active' ? 'bg-status-active' : ''}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const DeviceList = () => {
  const { devices, selectedRackId, setSelectedDeviceId } = useRackContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDeviceForAssignment, setSelectedDeviceForAssignment] = useState<string | null>(null);
  
  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Devices</h2>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DeviceForm onSuccess={() => setShowCreateForm(false)} onCancel={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDevices.length > 0 ? (
          filteredDevices.map(device => (
            <Card key={device.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <DeviceTypeIcon type={device.type} />
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                  </div>
                  <StatusBadge status={device.status} />
                </div>
                <CardDescription>
                  {device.brand} {device.model} - {device.unitHeight}U
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">S/N: {device.serialNumber}</span>
                  {device.ipAddress && (
                    <span className="text-muted-foreground">IP: {device.ipAddress}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedDeviceId(device.id)}>
                  Details
                </Button>
                
                <Dialog 
                  open={selectedDeviceForAssignment === device.id} 
                  onOpenChange={(open) => !open && setSelectedDeviceForAssignment(null)}
                >
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      disabled={!selectedRackId}
                      onClick={() => setSelectedDeviceForAssignment(device.id)}
                    >
                      Assign to Rack
                    </Button>
                  </DialogTrigger>
                  {selectedRackId && (
                    <DialogContent>
                      <AssignDeviceDialog 
                        deviceId={device.id} 
                        rackId={selectedRackId}
                        onSuccess={() => setSelectedDeviceForAssignment(null)}
                      />
                    </DialogContent>
                  )}
                </Dialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-10 text-muted-foreground">
            {searchTerm ? 
              'No devices match your search criteria' : 
              'No devices found. Add your first device to get started.'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;
