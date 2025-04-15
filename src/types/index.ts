
export type RackUnit = {
  id: string;
  position: number;
  occupied: boolean;
  deviceId?: string;
};

export type DeviceStatus = 'active' | 'warning' | 'error' | 'inactive';

export type DeviceType = 'server' | 'switch' | 'router' | 'storage' | 'other';

export type PortType = 'ethernet' | 'usb' | 'power' | 'hdmi' | 'serial' | 'fiber' | 'other';

export type PortStatus = 'connected' | 'disconnected' | 'error';

export type Port = {
  id: string;
  name: string;
  type: PortType;
  status: PortStatus;
  connectedToDeviceId?: string;
  connectedToPortId?: string;
  notes?: string;
  speed?: string;
  location: 'front' | 'back';
};

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  ipAddress?: string;
  macAddress?: string;
  status: DeviceStatus;
  unitHeight: number;
  powerConsumption?: number;
  notes?: string;
  ports: Port[];
};

export type Rack = {
  id: string;
  name: string;
  location: string;
  units: RackUnit[];
  totalUnits: number;
};
