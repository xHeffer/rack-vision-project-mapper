
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Device, DeviceStatus, DeviceType, Rack, RackUnit } from '../types';
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

// Sample device data
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
    notes: "Primary web server"
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
    notes: "Core network switch"
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
    notes: "Primary storage - Disk 3 showing warnings"
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
      ...deviceData
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
      getRackById
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
