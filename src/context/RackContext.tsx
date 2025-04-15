import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Device, DeviceStatus, DeviceType, Rack, RackUnit, Port, PortType, PortStatus } from '../types';
import { toast } from '@/components/ui/use-toast';

interface RackContextProps {
  racks: Rack[];
  devices: Device[];
  selectedRackId: string | null;
  selectedDeviceId: string | null;
  setSelectedRackId: (id: string | null) => void;
  setSelectedDeviceId: (id: string | null) => void;
  addRack: (name: string, location: string, totalUnits: number) => void;
  updateRack: (rack: Rack) => void;
  deleteRack: (id: string) => void;
  addDevice: (device: Omit<Device, 'id'>) => string;
  updateDevice: (device: Device) => void;
  deleteDevice: (id: string) => void;
  assignDeviceToUnit: (deviceId: string, rackId: string, startingPosition: number) => void;
  removeDeviceFromRack: (deviceId: string, rackId: string) => void;
  getDeviceById: (id: string | undefined) => Device | undefined;
  getRackById: (id: string | undefined) => Rack | undefined;
  addPort: (deviceId: string, port: Omit<Port, 'id'>) => void;
  updatePort: (deviceId: string, portId: string, portData: Partial<Port>) => void;
  deletePort: (deviceId: string, portId: string) => void;
  connectPorts: (sourceDeviceId: string, sourcePortId: string, targetDeviceId: string, targetPortId: string) => void;
  disconnectPort: (deviceId: string, portId: string) => void;
}

const RackContext = createContext<RackContextProps | undefined>(undefined);

// Sample data for initial state
const createInitialUnits = (totalUnits: number): RackUnit[] => {
  return Array.from({ length: totalUnits }, (_, i) => ({
    id: uuidv4(),
    position: totalUnits - i, // Units are numbered from bottom to top
    occupied: false
  }));
};

const initialRacks: Rack[] = [
  {
    id: uuidv4(),
    name: "Rack A01",
    location: "Data Center 1 - Row 1",
    totalUnits: 42,
    units: createInitialUnits(42)
  }
];

// Sample device data with ports
const initialDevices: Device[] = [
  {
    id: uuidv4(),
    name: "Web Server 01",
    type: "server",
    brand: "Dell",
    model: "PowerEdge R740",
    serialNumber: "SRV-2023-001",
    ipAddress: "192.168.1.101",
    macAddress: "00:11:22:33:44:55",
    status: "active",
    unitHeight: 2,
    powerConsumption: 450,
    notes: "Primary web server",
    ports: [
      {
        id: uuidv4(),
        name: "eth0",
        type: "ethernet",
        status: "connected",
        notes: "Connected to Core Switch",
        speed: "1Gbps",
        location: "back"
      },
      {
        id: uuidv4(),
        name: "eth1",
        type: "ethernet",
        status: "disconnected",
        speed: "1Gbps",
        location: "back"
      },
      {
        id: uuidv4(),
        name: "Power 1",
        type: "power",
        status: "connected",
        notes: "Connected to PDU A",
        location: "back"
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Core Switch",
    type: "switch",
    brand: "Cisco",
    model: "Catalyst 9500",
    serialNumber: "SW-2023-001",
    ipAddress: "192.168.1.10",
    macAddress: "AA:BB:CC:DD:EE:FF",
    status: "active",
    unitHeight: 1,
    powerConsumption: 150,
    notes: "Core network switch",
    ports: [
      {
        id: uuidv4(),
        name: "Gig 1/0/1",
        type: "ethernet",
        status: "connected",
        notes: "Connected to Web Server 01",
        speed: "1Gbps",
        location: "front"
      },
      {
        id: uuidv4(),
        name: "Gig 1/0/2",
        type: "ethernet",
        status: "connected",
        notes: "Connected to Storage Array",
        speed: "10Gbps",
        location: "front"
      },
      {
        id: uuidv4(),
        name: "Power",
        type: "power",
        status: "connected",
        notes: "Connected to PDU B",
        location: "back"
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Storage Array",
    type: "storage",
    brand: "NetApp",
    model: "FAS8300",
    serialNumber: "ST-2023-001",
    ipAddress: "192.168.1.201",
    macAddress: "11:22:33:44:55:66",
    status: "warning",
    unitHeight: 4,
    powerConsumption: 800,
    notes: "Primary storage - Disk 3 showing warnings",
    ports: [
      {
        id: uuidv4(),
        name: "FC1",
        type: "fiber",
        status: "connected",
        speed: "16Gbps",
        location: "back"
      },
      {
        id: uuidv4(),
        name: "FC2",
        type: "fiber",
        status: "disconnected",
        speed: "16Gbps",
        location: "back"
      },
      {
        id: uuidv4(),
        name: "Mgmt",
        type: "ethernet",
        status: "connected",
        notes: "Connected to Core Switch",
        speed: "1Gbps",
        location: "back"
      }
    ]
  }
];

export const RackProvider = ({ children }: { children: React.ReactNode }) => {
  const [racks, setRacks] = useState<Rack[]>(initialRacks);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(initialRacks[0]?.id || null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const addRack = (name: string, location: string, totalUnits: number) => {
    const newRack: Rack = {
      id: uuidv4(),
      name,
      location,
      totalUnits,
      units: createInitialUnits(totalUnits)
    };
    
    setRacks(prev => [...prev, newRack]);
    toast({
      title: "Rack Added",
      description: `${name} has been added successfully.`,
    });
  };

  const updateRack = (updatedRack: Rack) => {
    setRacks(prev => prev.map(rack => rack.id === updatedRack.id ? updatedRack : rack));
    toast({
      title: "Rack Updated",
      description: `${updatedRack.name} has been updated successfully.`,
    });
  };

  const deleteRack = (id: string) => {
    const rackToDelete = racks.find(rack => rack.id === id);
    if (!rackToDelete) return;

    // Check if any devices are assigned to this rack
    const hasAssignedDevices = rackToDelete.units.some(unit => unit.occupied);
    
    if (hasAssignedDevices) {
      toast({
        title: "Cannot Delete Rack",
        description: "This rack has assigned devices. Please remove all devices first.",
        variant: "destructive"
      });
      return;
    }

    setRacks(prev => prev.filter(rack => rack.id !== id));
    if (selectedRackId === id) {
      setSelectedRackId(null);
    }
    toast({
      title: "Rack Deleted",
      description: `${rackToDelete.name} has been removed successfully.`,
    });
  };

  const addDevice = (deviceData: Omit<Device, 'id'>) => {
    const id = uuidv4();
    const newDevice: Device = {
      id,
      ...deviceData,
      ports: deviceData.ports || [] // Ensure ports array is initialized
    };
    
    setDevices(prev => [...prev, newDevice]);
    toast({
      title: "Device Added",
      description: `${deviceData.name} has been added successfully.`,
    });
    
    return id;
  };

  const updateDevice = (updatedDevice: Device) => {
    setDevices(prev => prev.map(device => device.id === updatedDevice.id ? updatedDevice : device));
    toast({
      title: "Device Updated",
      description: `${updatedDevice.name} has been updated successfully.`,
    });
  };

  const deleteDevice = (id: string) => {
    const deviceToDelete = devices.find(device => device.id === id);
    if (!deviceToDelete) return;

    // Remove the device from any rack units
    setRacks(prev => prev.map(rack => ({
      ...rack,
      units: rack.units.map(unit => 
        unit.deviceId === id ? { ...unit, occupied: false, deviceId: undefined } : unit
      )
    })));

    // Remove the device
    setDevices(prev => prev.filter(device => device.id !== id));
    
    if (selectedDeviceId === id) {
      setSelectedDeviceId(null);
    }
    
    toast({
      title: "Device Deleted",
      description: `${deviceToDelete.name} has been removed successfully.`,
    });
  };

  const assignDeviceToUnit = (deviceId: string, rackId: string, startingPosition: number) => {
    const device = devices.find(d => d.id === deviceId);
    const rack = racks.find(r => r.id === rackId);
    
    if (!device || !rack) {
      toast({
        title: "Error",
        description: "Device or rack not found.",
        variant: "destructive"
      });
      return;
    }

    // Check if the required units are available
    const requiredUnits = Array.from({ length: device.unitHeight }, (_, i) => 
      startingPosition - i
    );
    
    const allUnitsAvailable = requiredUnits.every(pos => {
      const unit = rack.units.find(u => u.position === pos);
      return unit && !unit.occupied;
    });
    
    if (!allUnitsAvailable) {
      toast({
        title: "Cannot Assign Device",
        description: "One or more units are already occupied or don't exist.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the rack units
    setRacks(prev => prev.map(r => {
      if (r.id !== rackId) return r;
      
      return {
        ...r,
        units: r.units.map(unit => {
          if (requiredUnits.includes(unit.position)) {
            return { ...unit, occupied: true, deviceId };
          }
          return unit;
        })
      };
    }));
    
    toast({
      title: "Device Assigned",
      description: `${device.name} has been assigned to ${rack.name}.`,
    });
  };

  const removeDeviceFromRack = (deviceId: string, rackId: string) => {
    const device = devices.find(d => d.id === deviceId);
    const rack = racks.find(r => r.id === rackId);
    
    if (!device || !rack) {
      toast({
        title: "Error",
        description: "Device or rack not found.",
        variant: "destructive"
      });
      return;
    }
    
    setRacks(prev => prev.map(r => {
      if (r.id !== rackId) return r;
      
      return {
        ...r,
        units: r.units.map(unit => {
          if (unit.deviceId === deviceId) {
            return { ...unit, occupied: false, deviceId: undefined };
          }
          return unit;
        })
      };
    }));
    
    toast({
      title: "Device Removed",
      description: `${device.name} has been removed from ${rack.name}.`,
    });
  };

  const addPort = (deviceId: string, port: Omit<Port, 'id'>) => {
    const newPort: Port = {
      id: uuidv4(),
      ...port
    };
    
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          ports: [...device.ports, newPort]
        };
      }
      return device;
    }));
    
    toast({
      title: "Port Added",
      description: `${port.name} has been added successfully.`,
    });
  };

  const updatePort = (deviceId: string, portId: string, portData: Partial<Port>) => {
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          ports: device.ports.map(port => {
            if (port.id === portId) {
              return {
                ...port,
                ...portData
              };
            }
            return port;
          })
        };
      }
      return device;
    }));
    
    toast({
      title: "Port Updated",
      description: "Port has been updated successfully.",
    });
  };

  const deletePort = (deviceId: string, portId: string) => {
    // First disconnect the port if it's connected
    const device = devices.find(d => d.id === deviceId);
    const port = device?.ports.find(p => p.id === portId);
    
    if (port && port.connectedToDeviceId && port.connectedToPortId) {
      disconnectPort(deviceId, portId);
    }
    
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          ports: device.ports.filter(port => port.id !== portId)
        };
      }
      return device;
    }));
    
    toast({
      title: "Port Deleted",
      description: "Port has been removed successfully.",
    });
  };

  const connectPorts = (sourceDeviceId: string, sourcePortId: string, targetDeviceId: string, targetPortId: string) => {
    // Update both ports to show they're connected to each other
    setDevices(prev => prev.map(device => {
      if (device.id === sourceDeviceId) {
        return {
          ...device,
          ports: device.ports.map(port => {
            if (port.id === sourcePortId) {
              return {
                ...port,
                status: 'connected',
                connectedToDeviceId: targetDeviceId,
                connectedToPortId: targetPortId
              };
            }
            return port;
          })
        };
      }
      if (device.id === targetDeviceId) {
        return {
          ...device,
          ports: device.ports.map(port => {
            if (port.id === targetPortId) {
              return {
                ...port,
                status: 'connected',
                connectedToDeviceId: sourceDeviceId,
                connectedToPortId: sourcePortId
              };
            }
            return port;
          })
        };
      }
      return device;
    }));
    
    toast({
      title: "Ports Connected",
      description: "Ports have been connected successfully.",
    });
  };

  const disconnectPort = (deviceId: string, portId: string) => {
    // Find the connected port
    const device = devices.find(d => d.id === deviceId);
    const port = device?.ports.find(p => p.id === portId);
    
    if (!port || !port.connectedToDeviceId || !port.connectedToPortId) {
      return;
    }
    
    const connectedDeviceId = port.connectedToDeviceId;
    const connectedPortId = port.connectedToPortId;
    
    // Update both ports to disconnect them
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          ports: device.ports.map(p => {
            if (p.id === portId) {
              return {
                ...p,
                status: 'disconnected',
                connectedToDeviceId: undefined,
                connectedToPortId: undefined
              };
            }
            return p;
          })
        };
      }
      if (device.id === connectedDeviceId) {
        return {
          ...device,
          ports: device.ports.map(p => {
            if (p.id === connectedPortId) {
              return {
                ...p,
                status: 'disconnected',
                connectedToDeviceId: undefined,
                connectedToPortId: undefined
              };
            }
            return p;
          })
        };
      }
      return device;
    }));
    
    toast({
      title: "Port Disconnected",
      description: "Port has been disconnected successfully.",
    });
  };

  const getDeviceById = (id: string | undefined) => {
    if (!id) return undefined;
    return devices.find(device => device.id === id);
  };

  const getRackById = (id: string | undefined) => {
    if (!id) return undefined;
    return racks.find(rack => rack.id === id);
  };

  return (
    <RackContext.Provider value={{
      racks,
      devices,
      selectedRackId,
      selectedDeviceId,
      setSelectedRackId,
      setSelectedDeviceId,
      addRack,
      updateRack,
      deleteRack,
      addDevice,
      updateDevice,
      deleteDevice,
      assignDeviceToUnit,
      removeDeviceFromRack,
      getDeviceById,
      getRackById,
      addPort,
      updatePort,
      deletePort,
      connectPorts,
      disconnectPort
    }}>
      {children}
    </RackContext.Provider>
  );
};

export const useRackContext = () => {
  const context = useContext(RackContext);
  if (context === undefined) {
    throw new Error('useRackContext must be used within a RackProvider');
  }
  return context;
};
