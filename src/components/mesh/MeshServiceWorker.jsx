import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Service Worker registration and mesh network initialization
export const MESH_SW_CODE = `
// MX2LM Mesh Network Service Worker v1.0
const MESH_VERSION = '1.0.0';
const CACHE_NAME = 'mesh-cache-v1';
const SYNC_INTERVAL = 30000; // 30 seconds

let nodeId = null;
let peerConnections = new Map();
let sharedData = { brains: [], tapes: [], marketplaceItems: [] };

// Generate unique node ID
function generateNodeId() {
  return 'node_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

// Initialize mesh node
self.addEventListener('install', (event) => {
  console.log('[MeshSW] Installing Mesh Network Service Worker');
  nodeId = generateNodeId();
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[MeshSW] Mesh node activated:', nodeId);
  event.waitUntil(clients.claim());
});

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'REGISTER_NODE':
      nodeId = payload.nodeId || nodeId;
      broadcastToClients({ type: 'NODE_REGISTERED', nodeId });
      break;
      
    case 'SHARE_BRAIN':
      sharedData.brains.push(payload.brainId);
      broadcastToClients({ type: 'BRAIN_SHARED', brainId: payload.brainId });
      break;
      
    case 'SHARE_TAPE':
      sharedData.tapes.push(payload.tapeId);
      broadcastToClients({ type: 'TAPE_SHARED', tapeId: payload.tapeId });
      break;
      
    case 'GET_MESH_STATUS':
      broadcastToClients({ 
        type: 'MESH_STATUS', 
        nodeId,
        peers: peerConnections.size,
        shared: sharedData
      });
      break;
      
    case 'SYNC_REQUEST':
      // Respond with our shared data
      broadcastToClients({ type: 'SYNC_RESPONSE', data: sharedData, fromNode: nodeId });
      break;
      
    case 'PEER_DATA':
      // Merge peer data
      if (payload.brains) sharedData.brains = [...new Set([...sharedData.brains, ...payload.brains])];
      if (payload.tapes) sharedData.tapes = [...new Set([...sharedData.tapes, ...payload.tapes])];
      broadcastToClients({ type: 'DATA_SYNCED', data: sharedData });
      break;
  }
});

// Broadcast to all clients
async function broadcastToClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage(message));
}

// Periodic sync
setInterval(() => {
  broadcastToClients({ type: 'HEARTBEAT', nodeId, timestamp: Date.now() });
}, SYNC_INTERVAL);
`;

export function useMeshNetwork() {
  const [nodeId, setNodeId] = useState(null);
  const [meshStatus, setMeshStatus] = useState({ peers: 0, shared: { brains: [], tapes: [] } });
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, []);

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    try {
      // Create blob URL for service worker
      const swBlob = new Blob([MESH_SW_CODE], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(swBlob);
      
      // For now, we'll simulate SW behavior in-memory since blob URLs don't work for SW
      const storedNodeId = localStorage.getItem('mesh_node_id') || `node_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
      localStorage.setItem('mesh_node_id', storedNodeId);
      setNodeId(storedNodeId);
      setIsRegistered(true);
      
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  };

  const handleSWMessage = (event) => {
    const { type, ...data } = event.data;
    switch (type) {
      case 'NODE_REGISTERED':
        setNodeId(data.nodeId);
        setIsRegistered(true);
        break;
      case 'MESH_STATUS':
        setMeshStatus({ peers: data.peers, shared: data.shared });
        break;
      case 'HEARTBEAT':
        // Update UI if needed
        break;
    }
  };

  const shareBrain = (brainId) => {
    const shared = JSON.parse(localStorage.getItem('mesh_shared_brains') || '[]');
    if (!shared.includes(brainId)) {
      shared.push(brainId);
      localStorage.setItem('mesh_shared_brains', JSON.stringify(shared));
    }
  };

  const shareTape = (tapeId) => {
    const shared = JSON.parse(localStorage.getItem('mesh_shared_tapes') || '[]');
    if (!shared.includes(tapeId)) {
      shared.push(tapeId);
      localStorage.setItem('mesh_shared_tapes', JSON.stringify(shared));
    }
  };

  const getSharedData = () => ({
    brains: JSON.parse(localStorage.getItem('mesh_shared_brains') || '[]'),
    tapes: JSON.parse(localStorage.getItem('mesh_shared_tapes') || '[]')
  });

  return { nodeId, meshStatus, isRegistered, shareBrain, shareTape, getSharedData };
}

export default function MeshServiceWorker({ children }) {
  const mesh = useMeshNetwork();
  
  return (
    <MeshContext.Provider value={mesh}>
      {children}
    </MeshContext.Provider>
  );
}

export const MeshContext = React.createContext(null);