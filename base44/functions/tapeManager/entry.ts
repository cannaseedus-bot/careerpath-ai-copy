import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// SCXQ2 Compression Simulation (simplified for demo)
function scxq2Compress(data) {
    const jsonStr = JSON.stringify(data);
    const originalSize = new TextEncoder().encode(jsonStr).length;
    
    // Simulate compression by storing as base64 with metadata
    const compressed = {
        _scxq2: true,
        _version: "2.0",
        _original_size: originalSize,
        _data: btoa(unescape(encodeURIComponent(jsonStr)))
    };
    
    const compressedSize = new TextEncoder().encode(JSON.stringify(compressed)).length;
    const ratio = originalSize / compressedSize;
    
    return {
        compressed,
        originalSize,
        compressedSize,
        ratio: Math.max(ratio, 0.8) // Simulated ratio
    };
}

function scxq2Decompress(compressed) {
    if (!compressed._scxq2) return compressed;
    const jsonStr = decodeURIComponent(escape(atob(compressed._data)));
    return JSON.parse(jsonStr);
}

// Generate checksum
async function generateChecksum(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Compute diff between two objects
function computeDiff(oldObj, newObj) {
    const diff = { added: {}, removed: {}, changed: {} };
    
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    
    for (const key of allKeys) {
        if (!(key in (oldObj || {}))) {
            diff.added[key] = newObj[key];
        } else if (!(key in (newObj || {}))) {
            diff.removed[key] = oldObj[key];
        } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
            diff.changed[key] = { from: oldObj[key], to: newObj[key] };
        }
    }
    
    return diff;
}

// Increment version
function incrementVersion(version, type = 'patch') {
    const [major, minor, patch] = (version || '0.0.0').split('.').map(Number);
    switch (type) {
        case 'major': return `${major + 1}.0.0`;
        case 'minor': return `${major}.${minor + 1}.0`;
        default: return `${major}.${minor}.${patch + 1}`;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { action, ...params } = await req.json();
        
        switch (action) {
            // CREATE TAPE (commit)
            case 'commit': {
                const { entityType, entityId, message, branch = 'main', versionType = 'patch', tags = [] } = params;
                
                // Get entity data
                const entityData = await base44.entities[entityType].get(entityId);
                if (!entityData) {
                    return Response.json({ error: 'Entity not found' }, { status: 404 });
                }
                
                // Get or create registry
                let registries = await base44.entities.TapeRegistry.filter({ 
                    entity_type: entityType, 
                    entity_id: entityId 
                });
                
                let registry = registries[0];
                let parentTape = null;
                let newVersion = '1.0.0';
                
                if (registry) {
                    // Get parent tape
                    const branchInfo = registry.branches?.find(b => b.name === branch);
                    if (branchInfo?.head_tape_id) {
                        parentTape = await base44.entities.Tape.get(branchInfo.head_tape_id);
                        newVersion = incrementVersion(parentTape.version, versionType);
                    }
                } else {
                    // Create new registry
                    registry = await base44.entities.TapeRegistry.create({
                        name: `${entityType}/${entityId}`,
                        entity_type: entityType,
                        entity_id: entityId,
                        head_branch: 'main',
                        branches: [{ name: 'main', head_tape_id: null, created_date: new Date().toISOString() }],
                        total_tapes: 0,
                        total_size_bytes: 0
                    });
                }
                
                // Compress data
                const { compressed, originalSize, compressedSize, ratio } = scxq2Compress(entityData);
                const checksum = await generateChecksum(entityData);
                
                // Compute diff from parent
                let diffFromParent = null;
                if (parentTape) {
                    const parentData = scxq2Decompress(parentTape.snapshot_data);
                    diffFromParent = computeDiff(parentData, entityData);
                }
                
                // Create tape
                const tape = await base44.entities.Tape.create({
                    name: message || `${entityType} v${newVersion}`,
                    description: message,
                    tape_type: entityType === 'UserProfile' ? 'profile' : 'project',
                    version: newVersion,
                    parent_tape_id: parentTape?.id || null,
                    branch,
                    entity_type: entityType,
                    entity_id: entityId,
                    snapshot_data: compressed,
                    checksum,
                    compression_ratio: ratio,
                    size_bytes: compressedSize,
                    original_size_bytes: originalSize,
                    tags,
                    status: 'active',
                    diff_from_parent: diffFromParent
                });
                
                // Update registry
                const updatedBranches = registry.branches.map(b => 
                    b.name === branch ? { ...b, head_tape_id: tape.id } : b
                );
                
                await base44.entities.TapeRegistry.update(registry.id, {
                    current_version: newVersion,
                    current_tape_id: tape.id,
                    branches: updatedBranches,
                    total_tapes: (registry.total_tapes || 0) + 1,
                    total_size_bytes: (registry.total_size_bytes || 0) + compressedSize
                });
                
                return Response.json({ 
                    success: true, 
                    tape,
                    message: `Committed ${entityType} as tape v${newVersion}`
                });
            }
            
            // CHECKOUT (revert to tape)
            case 'checkout': {
                const { tapeId } = params;
                
                const tape = await base44.entities.Tape.get(tapeId);
                if (!tape) {
                    return Response.json({ error: 'Tape not found' }, { status: 404 });
                }
                
                // Decompress snapshot
                const restoredData = scxq2Decompress(tape.snapshot_data);
                
                // Remove system fields
                const { id, created_date, updated_date, created_by, ...cleanData } = restoredData;
                
                // Update entity
                await base44.entities[tape.entity_type].update(tape.entity_id, cleanData);
                
                // Update registry
                const registries = await base44.entities.TapeRegistry.filter({
                    entity_type: tape.entity_type,
                    entity_id: tape.entity_id
                });
                
                if (registries[0]) {
                    await base44.entities.TapeRegistry.update(registries[0].id, {
                        current_version: tape.version,
                        current_tape_id: tapeId
                    });
                }
                
                return Response.json({ 
                    success: true, 
                    message: `Checked out ${tape.entity_type} to v${tape.version}`,
                    data: restoredData
                });
            }
            
            // LIST TAPES (log)
            case 'log': {
                const { entityType, entityId, branch, limit = 20 } = params;
                
                let query = { entity_type: entityType, entity_id: entityId, status: 'active' };
                if (branch) query.branch = branch;
                
                const tapes = await base44.entities.Tape.filter(query, '-created_date', limit);
                
                return Response.json({ 
                    success: true, 
                    tapes: tapes.map(t => ({
                        id: t.id,
                        version: t.version,
                        name: t.name,
                        description: t.description,
                        branch: t.branch,
                        checksum: t.checksum?.substring(0, 8),
                        size_bytes: t.size_bytes,
                        compression_ratio: t.compression_ratio,
                        tags: t.tags,
                        created_date: t.created_date,
                        created_by: t.created_by
                    }))
                });
            }
            
            // DIFF between two tapes
            case 'diff': {
                const { tapeId1, tapeId2 } = params;
                
                const tape1 = await base44.entities.Tape.get(tapeId1);
                const tape2 = await base44.entities.Tape.get(tapeId2);
                
                if (!tape1 || !tape2) {
                    return Response.json({ error: 'Tape(s) not found' }, { status: 404 });
                }
                
                const data1 = scxq2Decompress(tape1.snapshot_data);
                const data2 = scxq2Decompress(tape2.snapshot_data);
                
                const diff = computeDiff(data1, data2);
                
                return Response.json({ 
                    success: true, 
                    diff,
                    from: { version: tape1.version, checksum: tape1.checksum?.substring(0, 8) },
                    to: { version: tape2.version, checksum: tape2.checksum?.substring(0, 8) }
                });
            }
            
            // CREATE BRANCH
            case 'branch': {
                const { entityType, entityId, branchName, fromTapeId } = params;
                
                const registries = await base44.entities.TapeRegistry.filter({
                    entity_type: entityType,
                    entity_id: entityId
                });
                
                if (!registries[0]) {
                    return Response.json({ error: 'Registry not found' }, { status: 404 });
                }
                
                const registry = registries[0];
                const existingBranch = registry.branches?.find(b => b.name === branchName);
                
                if (existingBranch) {
                    return Response.json({ error: 'Branch already exists' }, { status: 400 });
                }
                
                const newBranches = [
                    ...(registry.branches || []),
                    { 
                        name: branchName, 
                        head_tape_id: fromTapeId || registry.current_tape_id,
                        created_date: new Date().toISOString()
                    }
                ];
                
                await base44.entities.TapeRegistry.update(registry.id, { branches: newBranches });
                
                return Response.json({ 
                    success: true, 
                    message: `Created branch '${branchName}'`
                });
            }
            
            // GET REGISTRY STATUS
            case 'status': {
                const { entityType, entityId } = params;
                
                const registries = await base44.entities.TapeRegistry.filter({
                    entity_type: entityType,
                    entity_id: entityId
                });
                
                if (!registries[0]) {
                    return Response.json({ 
                        success: true, 
                        initialized: false,
                        message: 'No version history. Run commit to initialize.'
                    });
                }
                
                const registry = registries[0];
                
                return Response.json({
                    success: true,
                    initialized: true,
                    registry: {
                        name: registry.name,
                        current_version: registry.current_version,
                        head_branch: registry.head_branch,
                        branches: registry.branches,
                        total_tapes: registry.total_tapes,
                        total_size_bytes: registry.total_size_bytes
                    }
                });
            }
            
            // CREATE RELEASE from tape
            case 'release': {
                const { tapeId, releaseTag, releaseType = 'stable', releaseNotes = '' } = params;
                
                const tape = await base44.entities.Tape.get(tapeId);
                if (!tape) {
                    return Response.json({ error: 'Tape not found' }, { status: 404 });
                }
                
                // Check if release tag already exists
                const existingRelease = await base44.entities.Tape.filter({
                    entity_type: tape.entity_type,
                    entity_id: tape.entity_id,
                    release_tag: releaseTag
                });
                
                if (existingRelease.length > 0) {
                    return Response.json({ error: `Release tag '${releaseTag}' already exists` }, { status: 400 });
                }
                
                // Update tape with release info
                await base44.entities.Tape.update(tapeId, {
                    release_tag: releaseTag,
                    is_release: true,
                    release_type: releaseType,
                    release_notes: releaseNotes,
                    tags: [...(tape.tags || []), 'release', releaseType]
                });
                
                return Response.json({
                    success: true,
                    message: `Created release ${releaseTag}`,
                    releaseTag,
                    releaseType
                });
            }
            
            // LIST RELEASES
            case 'releases': {
                const { entityType, entityId } = params;
                
                const releases = await base44.entities.Tape.filter({
                    entity_type: entityType,
                    entity_id: entityId,
                    is_release: true
                }, '-created_date', 50);
                
                return Response.json({
                    success: true,
                    releases: releases.map(r => ({
                        id: r.id,
                        release_tag: r.release_tag,
                        release_type: r.release_type,
                        release_notes: r.release_notes,
                        version: r.version,
                        branch: r.branch,
                        checksum: r.checksum?.substring(0, 8),
                        created_date: r.created_date
                    }))
                });
            }
            
            // COMPARE BRANCHES
            case 'compareBranches': {
                const { entityType, entityId, branch1, branch2 } = params;
                
                // Get tapes from both branches
                const tapes1 = await base44.entities.Tape.filter({
                    entity_type: entityType,
                    entity_id: entityId,
                    branch: branch1,
                    status: 'active'
                }, '-created_date', 50);
                
                const tapes2 = await base44.entities.Tape.filter({
                    entity_type: entityType,
                    entity_id: entityId,
                    branch: branch2,
                    status: 'active'
                }, '-created_date', 50);
                
                // Find common ancestor (simplified - find matching checksums)
                const checksums1 = new Set(tapes1.map(t => t.checksum));
                const checksums2 = new Set(tapes2.map(t => t.checksum));
                
                const commonChecksums = [...checksums1].filter(c => checksums2.has(c));
                const commonAncestor = commonChecksums.length > 0 
                    ? tapes1.find(t => t.checksum === commonChecksums[0]) 
                    : null;
                
                // Tapes unique to each branch
                const uniqueTo1 = tapes1.filter(t => !checksums2.has(t.checksum));
                const uniqueTo2 = tapes2.filter(t => !checksums1.has(t.checksum));
                
                // Get latest from each branch for diff
                let contentDiff = null;
                if (tapes1[0] && tapes2[0]) {
                    const data1 = scxq2Decompress(tapes1[0].snapshot_data);
                    const data2 = scxq2Decompress(tapes2[0].snapshot_data);
                    contentDiff = computeDiff(data1, data2);
                }
                
                return Response.json({
                    success: true,
                    branch1: {
                        name: branch1,
                        totalTapes: tapes1.length,
                        latestVersion: tapes1[0]?.version,
                        uniqueTapes: uniqueTo1.map(t => ({
                            id: t.id,
                            version: t.version,
                            name: t.name,
                            checksum: t.checksum?.substring(0, 8),
                            created_date: t.created_date
                        }))
                    },
                    branch2: {
                        name: branch2,
                        totalTapes: tapes2.length,
                        latestVersion: tapes2[0]?.version,
                        uniqueTapes: uniqueTo2.map(t => ({
                            id: t.id,
                            version: t.version,
                            name: t.name,
                            checksum: t.checksum?.substring(0, 8),
                            created_date: t.created_date
                        }))
                    },
                    commonAncestor: commonAncestor ? {
                        id: commonAncestor.id,
                        version: commonAncestor.version,
                        checksum: commonAncestor.checksum?.substring(0, 8)
                    } : null,
                    contentDiff,
                    ahead: uniqueTo1.length,
                    behind: uniqueTo2.length
                });
            }
            
            // CREATE BRAIN from tape
            case 'createBrain': {
                const { tapeId, name, description, isPublic = false, tags = [], modelArchitecture, quantization, capabilities = [] } = params;
                
                const tape = await base44.entities.Tape.get(tapeId);
                if (!tape) {
                    return Response.json({ error: 'Tape not found' }, { status: 404 });
                }
                
                // Brain contains model-like structure from tape snapshot
                const snapshotData = tape.snapshot_data;
                const checksum = await generateChecksum(snapshotData);
                
                const brain = await base44.entities.Brain.create({
                    name: name || `${tape.name} Brain`,
                    description: description || `Brain created from tape v${tape.version}`,
                    brain_type: 'full_package',
                    version: tape.version,
                    model_files: {
                        snapshot: snapshotData,
                        source_version: tape.version,
                        source_branch: tape.branch
                    },
                    scxq2_compressed: true,
                    compression_ratio: tape.compression_ratio,
                    size_bytes: tape.size_bytes,
                    original_size_bytes: tape.original_size_bytes,
                    checksum,
                    source_tape_id: tapeId,
                    is_public: isPublic,
                    tags,
                    model_architecture: modelArchitecture,
                    quantization,
                    capabilities,
                    status: 'active',
                    last_synced: new Date().toISOString()
                });
                
                return Response.json({
                    success: true,
                    brain,
                    message: `Created brain '${brain.name}' from tape v${tape.version}`
                });
            }
            
            // FORK brain into new tape
            case 'forkBrain': {
                const { brainId, entityType, entityId, branch = 'main' } = params;
                
                const brain = await base44.entities.Brain.get(brainId);
                if (!brain) {
                    return Response.json({ error: 'Brain not found' }, { status: 404 });
                }
                
                // Create tape from brain
                const snapshotData = brain.model_files?.snapshot || {};
                const checksum = await generateChecksum(snapshotData);
                
                const tape = await base44.entities.Tape.create({
                    name: `Fork of ${brain.name}`,
                    description: `Forked from brain ${brain.name} v${brain.version}`,
                    tape_type: entityType === 'UserProfile' ? 'profile' : 'project',
                    version: brain.version,
                    branch,
                    entity_type: entityType,
                    entity_id: entityId,
                    snapshot_data: snapshotData,
                    checksum,
                    compression_ratio: brain.compression_ratio,
                    size_bytes: brain.size_bytes,
                    original_size_bytes: brain.original_size_bytes,
                    tags: ['forked', `brain:${brainId}`],
                    status: 'active'
                });
                
                // Update brain fork count
                await base44.entities.Brain.update(brainId, {
                    fork_count: (brain.fork_count || 0) + 1
                });
                
                return Response.json({
                    success: true,
                    tape,
                    message: `Forked brain '${brain.name}' into tape v${tape.version}`
                });
            }
            
            // PUSH tape changes to brain
            case 'push': {
                const { tapeId, brainId } = params;
                
                const tape = await base44.entities.Tape.get(tapeId);
                const brain = await base44.entities.Brain.get(brainId);
                
                if (!tape || !brain) {
                    return Response.json({ error: 'Tape or Brain not found' }, { status: 404 });
                }
                
                const checksum = await generateChecksum(tape.snapshot_data);
                
                await base44.entities.Brain.update(brainId, {
                    model_files: {
                        ...brain.model_files,
                        snapshot: tape.snapshot_data,
                        source_version: tape.version,
                        source_branch: tape.branch
                    },
                    version: tape.version,
                    checksum,
                    compression_ratio: tape.compression_ratio,
                    size_bytes: tape.size_bytes,
                    original_size_bytes: tape.original_size_bytes,
                    status: 'active',
                    last_synced: new Date().toISOString()
                });
                
                return Response.json({
                    success: true,
                    message: `Pushed tape v${tape.version} to brain '${brain.name}'`
                });
            }
            
            // PULL brain into tape
            case 'pull': {
                const { brainId, entityType, entityId, branch = 'main', message } = params;
                
                const brain = await base44.entities.Brain.get(brainId);
                if (!brain) {
                    return Response.json({ error: 'Brain not found' }, { status: 404 });
                }
                
                // Get registry for version
                const registries = await base44.entities.TapeRegistry.filter({
                    entity_type: entityType,
                    entity_id: entityId
                });
                
                const registry = registries[0];
                let newVersion = brain.version;
                
                if (registry?.current_version) {
                    newVersion = incrementVersion(registry.current_version, 'minor');
                }
                
                const snapshotData = brain.model_files?.snapshot || {};
                const checksum = await generateChecksum(snapshotData);
                
                const tape = await base44.entities.Tape.create({
                    name: message || `Pull from ${brain.name}`,
                    description: `Pulled from brain ${brain.name} v${brain.version}`,
                    tape_type: entityType === 'UserProfile' ? 'profile' : 'project',
                    version: newVersion,
                    branch,
                    entity_type: entityType,
                    entity_id: entityId,
                    snapshot_data: snapshotData,
                    checksum,
                    compression_ratio: brain.compression_ratio,
                    size_bytes: brain.size_bytes,
                    original_size_bytes: brain.original_size_bytes,
                    tags: ['pulled', `brain:${brainId}`],
                    status: 'active'
                });
                
                // Update brain pull count
                await base44.entities.Brain.update(brainId, {
                    pull_count: (brain.pull_count || 0) + 1
                });
                
                // Update registry
                if (registry) {
                    const updatedBranches = registry.branches.map(b =>
                        b.name === branch ? { ...b, head_tape_id: tape.id } : b
                    );
                    await base44.entities.TapeRegistry.update(registry.id, {
                        current_version: newVersion,
                        current_tape_id: tape.id,
                        branches: updatedBranches,
                        total_tapes: (registry.total_tapes || 0) + 1,
                        total_size_bytes: (registry.total_size_bytes || 0) + tape.size_bytes
                    });
                }
                
                return Response.json({
                    success: true,
                    tape,
                    message: `Pulled brain '${brain.name}' into tape v${newVersion}`
                });
            }
            
            // MERGE BRAINS
            case 'mergeBrains': {
                const { sourceBrainIds, targetName, targetBrainId, description, strategy = 'latest', isPublic = false } = params;
                
                if (!sourceBrainIds || sourceBrainIds.length < 2) {
                    return Response.json({ error: 'Need at least 2 brains to merge' }, { status: 400 });
                }
                
                // Fetch all source brains
                const brains = await Promise.all(
                    sourceBrainIds.map(id => base44.entities.Brain.get(id))
                );
                
                if (brains.some(b => !b)) {
                    return Response.json({ error: 'One or more brains not found' }, { status: 404 });
                }
                
                // If merging into existing brain, fetch it
                let existingBrain = null;
                if (targetBrainId) {
                    existingBrain = await base44.entities.Brain.get(targetBrainId);
                    if (!existingBrain) {
                        return Response.json({ error: 'Target brain not found' }, { status: 404 });
                    }
                }
                
                // Smart merge helper - semantic conflict resolution
                const smartMerge = (obj1, obj2, key) => {
                    if (Array.isArray(obj1) && Array.isArray(obj2)) {
                        const combined = [...obj1, ...obj2];
                        const seen = new Set();
                        return combined.filter(item => {
                            const k = typeof item === 'object' ? JSON.stringify(item) : item;
                            if (seen.has(k)) return false;
                            seen.add(k);
                            return true;
                        });
                    }
                    if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 && obj2) {
                        const result = { ...obj1 };
                        for (const [k, v] of Object.entries(obj2)) {
                            result[k] = k in result ? smartMerge(result[k], v, k) : v;
                        }
                        return result;
                    }
                    if (obj2 === null || obj2 === undefined || obj2 === '') return obj1;
                    if (obj1 === null || obj1 === undefined || obj1 === '') return obj2;
                    if (typeof obj1 === 'number' && typeof obj2 === 'number') {
                        if (key?.includes('level') || key?.includes('count') || key?.includes('size')) {
                            return Math.max(obj1, obj2);
                        }
                    }
                    return obj2;
                };
                
                // Start with existing brain data if merging into existing
                let mergedSnapshot = {};
                let mergedTags = new Set();
                let mergedCapabilities = new Set();
                
                if (existingBrain) {
                    const existingSnapshot = existingBrain.model_files?.snapshot || {};
                    mergedSnapshot = existingSnapshot._scxq2 ? scxq2Decompress(existingSnapshot) : existingSnapshot;
                    existingBrain.tags?.forEach(t => mergedTags.add(t));
                    existingBrain.capabilities?.forEach(c => mergedCapabilities.add(c));
                }
                
                // Merge based on strategy
                for (const brain of brains) {
                    const snapshot = brain.model_files?.snapshot || {};
                    const decompressed = snapshot._scxq2 ? scxq2Decompress(snapshot) : snapshot;
                    
                    if (strategy === 'latest') {
                        mergedSnapshot = { ...mergedSnapshot, ...decompressed };
                    } else if (strategy === 'combine') {
                        for (const [key, value] of Object.entries(decompressed)) {
                            if (Array.isArray(value) && Array.isArray(mergedSnapshot[key])) {
                                mergedSnapshot[key] = [...mergedSnapshot[key], ...value];
                            } else if (typeof value === 'object' && typeof mergedSnapshot[key] === 'object') {
                                mergedSnapshot[key] = { ...mergedSnapshot[key], ...value };
                            } else {
                                mergedSnapshot[key] = value;
                            }
                        }
                    } else if (strategy === 'smart') {
                        for (const [key, value] of Object.entries(decompressed)) {
                            mergedSnapshot[key] = key in mergedSnapshot 
                                ? smartMerge(mergedSnapshot[key], value, key) 
                                : value;
                        }
                    }
                    brain.tags?.forEach(t => mergedTags.add(t));
                    brain.capabilities?.forEach(c => mergedCapabilities.add(c));
                }
                
                // Compress merged data
                const { compressed, originalSize, compressedSize, ratio } = scxq2Compress(mergedSnapshot);
                const checksum = await generateChecksum(mergedSnapshot);
                
                // Determine version
                const versions = brains.map(b => b.version || '1.0.0');
                if (existingBrain) versions.push(existingBrain.version || '1.0.0');
                const highestVersion = versions.sort((a, b) => {
                    const [aMaj, aMin, aPat] = a.split('.').map(Number);
                    const [bMaj, bMin, bPat] = b.split('.').map(Number);
                    return bMaj - aMaj || bMin - aMin || bPat - aPat;
                })[0];
                const newVersion = incrementVersion(highestVersion, 'minor');
                
                let resultBrain;
                
                if (existingBrain) {
                    // Merge into existing brain - update with version bump
                    await base44.entities.Brain.update(targetBrainId, {
                        model_files: {
                            snapshot: compressed,
                            merge_sources: sourceBrainIds,
                            merge_strategy: strategy,
                            previous_version: existingBrain.version
                        },
                        version: newVersion,
                        size_bytes: compressedSize,
                        original_size_bytes: originalSize,
                        compression_ratio: ratio,
                        checksum,
                        tags: [...mergedTags, 'merged'],
                        capabilities: [...mergedCapabilities],
                        last_synced: new Date().toISOString(),
                        description: description || existingBrain.description
                    });
                    resultBrain = { ...existingBrain, version: newVersion };
                } else {
                    // Create new merged brain
                    resultBrain = await base44.entities.Brain.create({
                        name: targetName || `Merged Brain (${brains.length} sources)`,
                        description: description || `Merged from: ${brains.map(b => b.name).join(', ')}`,
                        brain_type: 'full_package',
                        version: newVersion,
                        model_files: {
                            snapshot: compressed,
                            merge_sources: sourceBrainIds,
                            merge_strategy: strategy
                        },
                        scxq2_compressed: true,
                        compression_ratio: ratio,
                        size_bytes: compressedSize,
                        original_size_bytes: originalSize,
                        checksum,
                        is_public: isPublic,
                        tags: [...mergedTags, 'merged'],
                        capabilities: [...mergedCapabilities],
                        status: 'active',
                        last_synced: new Date().toISOString()
                    });
                }
                
                return Response.json({
                    success: true,
                    brain: resultBrain,
                    merged_into_existing: !!existingBrain,
                    message: existingBrain 
                        ? `Merged ${brains.length} brains into '${existingBrain.name}' (v${newVersion})`
                        : `Merged ${brains.length} brains into '${resultBrain.name}'`,
                    stats: {
                        sourcesCount: brains.length,
                        strategy,
                        originalSize,
                        compressedSize,
                        compressionRatio: ratio
                    }
                });
            }
            
            // LIST BRAINS
            case 'listBrains': {
                const { publicOnly = false, tags = [] } = params;
                
                let query = { status: 'active' };
                if (publicOnly) query.is_public = true;
                
                let brains = await base44.entities.Brain.filter(query, '-created_date', 50);
                
                if (tags.length > 0) {
                    brains = brains.filter(b => tags.some(t => b.tags?.includes(t)));
                }
                
                return Response.json({
                    success: true,
                    brains: brains.map(b => ({
                        id: b.id,
                        name: b.name,
                        description: b.description,
                        version: b.version,
                        brain_type: b.brain_type,
                        model_architecture: b.model_architecture,
                        quantization: b.quantization,
                        capabilities: b.capabilities,
                        is_public: b.is_public,
                        fork_count: b.fork_count,
                        pull_count: b.pull_count,
                        size_bytes: b.size_bytes,
                        compression_ratio: b.compression_ratio,
                        tags: b.tags,
                        created_by: b.created_by,
                        created_date: b.created_date
                    }))
                });
            }
            
            // TAG existing tape
            case 'tag': {
                const { tapeId, tag } = params;
                
                const tape = await base44.entities.Tape.get(tapeId);
                if (!tape) {
                    return Response.json({ error: 'Tape not found' }, { status: 404 });
                }
                
                const existingTags = tape.tags || [];
                if (!existingTags.includes(tag)) {
                    await base44.entities.Tape.update(tapeId, {
                        tags: [...existingTags, tag]
                    });
                }
                
                return Response.json({
                    success: true,
                    message: `Added tag '${tag}' to tape v${tape.version}`
                });
            }
            
            // CREATE PIPELINE
            case 'createPipeline': {
                const { name, description, nodes = [], connections = [], triggers = [] } = params;
                
                // Generate API routes for each node
                const apiRoutes = nodes.map(node => ({
                    path: `/pipeline/${name.toLowerCase().replace(/\s+/g, '-')}/${node.id}`,
                    node_id: node.id,
                    method: 'POST'
                }));
                
                const pipeline = await base44.entities.BrainPipeline.create({
                    name,
                    description,
                    nodes,
                    connections,
                    api_routes: apiRoutes,
                    triggers,
                    status: 'draft'
                });
                
                return Response.json({
                    success: true,
                    pipeline,
                    message: `Created pipeline '${name}'`
                });
            }
            
            // EXECUTE PIPELINE
            case 'executePipeline': {
                const { pipelineId, inputData = {} } = params;
                
                const pipeline = await base44.entities.BrainPipeline.get(pipelineId);
                if (!pipeline) {
                    return Response.json({ error: 'Pipeline not found' }, { status: 404 });
                }
                
                const results = {};
                const executionLog = [];
                
                // Build execution order from connections (topological sort simplified)
                const nodeMap = new Map(pipeline.nodes.map(n => [n.id, n]));
                const executed = new Set();
                
                // Execute nodes in connection order
                for (const node of pipeline.nodes) {
                    if (executed.has(node.id)) continue;
                    
                    try {
                        let nodeData = inputData;
                        
                        // Get input from connected nodes
                        const incomingConnections = pipeline.connections.filter(c => c.to_node === node.id);
                        for (const conn of incomingConnections) {
                            if (results[conn.from_node]) {
                                nodeData = { ...nodeData, [conn.data_key || 'input']: results[conn.from_node] };
                            }
                        }
                        
                        // Execute based on node type
                        let output = null;
                        
                        if (node.type === 'brain') {
                            const brain = await base44.entities.Brain.get(node.source_id);
                            if (brain) {
                                const snapshot = brain.model_files?.snapshot || {};
                                output = snapshot._scxq2 ? scxq2Decompress(snapshot) : snapshot;
                                output = { ...output, _input: nodeData };
                            }
                        } else if (node.type === 'tape') {
                            const tape = await base44.entities.Tape.get(node.source_id);
                            if (tape) {
                                output = scxq2Decompress(tape.snapshot_data);
                                output = { ...output, _input: nodeData };
                            }
                        } else if (node.type === 'router') {
                            // Router passes data through with transformation
                            output = { routed: true, data: nodeData, config: node.config };
                        }
                        
                        results[node.id] = output;
                        executed.add(node.id);
                        executionLog.push({ node: node.id, status: 'success', timestamp: new Date().toISOString() });
                        
                    } catch (err) {
                        executionLog.push({ node: node.id, status: 'error', error: err.message, timestamp: new Date().toISOString() });
                    }
                }
                
                // Update pipeline stats
                await base44.entities.BrainPipeline.update(pipelineId, {
                    last_run: new Date().toISOString(),
                    run_count: (pipeline.run_count || 0) + 1,
                    status: 'active'
                });
                
                return Response.json({
                    success: true,
                    results,
                    executionLog,
                    message: `Executed pipeline '${pipeline.name}'`
                });
            }
            
            // LIST PIPELINES
            case 'listPipelines': {
                const pipelines = await base44.entities.BrainPipeline.filter({}, '-created_date', 50);
                
                return Response.json({
                    success: true,
                    pipelines: pipelines.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        status: p.status,
                        nodes_count: p.nodes?.length || 0,
                        connections_count: p.connections?.length || 0,
                        run_count: p.run_count,
                        last_run: p.last_run,
                        api_routes: p.api_routes
                    }))
                });
            }
            
            // CHECK TRIGGERS - evaluate if event should trigger pipelines
            case 'checkTriggers': {
                const { eventType, eventData = {} } = params;
                
                const pipelines = await base44.entities.BrainPipeline.filter({ status: 'active' });
                const triggeredPipelines = [];
                
                for (const pipeline of pipelines) {
                    if (!pipeline.triggers?.length) continue;
                    
                    for (const trigger of pipeline.triggers) {
                        if (!trigger.enabled || trigger.event !== eventType) continue;
                        
                        // Evaluate conditions
                        const conditions = trigger.conditions || {};
                        let shouldTrigger = true;
                        
                        if (conditions.entity_type && eventData.entity_type !== conditions.entity_type) {
                            shouldTrigger = false;
                        }
                        
                        if (conditions.branch_pattern && eventData.branch) {
                            const regex = new RegExp(conditions.branch_pattern);
                            if (!regex.test(eventData.branch)) shouldTrigger = false;
                        }
                        
                        if (conditions.tag_pattern && eventData.release_tag) {
                            const regex = new RegExp(conditions.tag_pattern);
                            if (!regex.test(eventData.release_tag)) shouldTrigger = false;
                        }
                        
                        if (conditions.release_type && conditions.release_type !== 'any' && eventData.release_type !== conditions.release_type) {
                            shouldTrigger = false;
                        }
                        
                        if (conditions.brain_name_pattern && eventData.brain_name) {
                            const regex = new RegExp(conditions.brain_name_pattern);
                            if (!regex.test(eventData.brain_name)) shouldTrigger = false;
                        }
                        
                        if (shouldTrigger) {
                            triggeredPipelines.push({
                                pipeline_id: pipeline.id,
                                pipeline_name: pipeline.name,
                                trigger_id: trigger.id,
                                event: eventType
                            });
                        }
                    }
                }
                
                return Response.json({
                    success: true,
                    event: eventType,
                    triggered: triggeredPipelines.length,
                    pipelines: triggeredPipelines
                });
            }
            
            // AUTO TRIGGER - check and execute matching pipelines
            case 'autoTrigger': {
                const { eventType, eventData = {}, execute = false } = params;
                
                // First check which pipelines match
                const pipelines = await base44.entities.BrainPipeline.filter({ status: 'active' });
                const results = [];
                
                for (const pipeline of pipelines) {
                    if (!pipeline.triggers?.length) continue;
                    
                    for (const trigger of pipeline.triggers) {
                        if (!trigger.enabled || trigger.event !== eventType) continue;
                        
                        const conditions = trigger.conditions || {};
                        let match = true;
                        
                        if (conditions.entity_type && eventData.entity_type !== conditions.entity_type) match = false;
                        if (conditions.branch_pattern && eventData.branch && !new RegExp(conditions.branch_pattern).test(eventData.branch)) match = false;
                        if (conditions.tag_pattern && eventData.release_tag && !new RegExp(conditions.tag_pattern).test(eventData.release_tag)) match = false;
                        if (conditions.release_type && conditions.release_type !== 'any' && eventData.release_type !== conditions.release_type) match = false;
                        if (conditions.brain_name_pattern && eventData.brain_name && !new RegExp(conditions.brain_name_pattern).test(eventData.brain_name)) match = false;
                        
                        if (match) {
                            let executionResult = null;
                            
                            if (execute) {
                                // Actually execute the pipeline
                                const execResults = {};
                                const execLog = [];
                                
                                for (const node of (pipeline.nodes || [])) {
                                    try {
                                        let output = null;
                                        const nodeInput = { ...eventData };
                                        
                                        if (node.type === 'brain' && node.source_id) {
                                            const brain = await base44.entities.Brain.get(node.source_id);
                                            output = brain?.model_files?.snapshot || {};
                                        } else if (node.type === 'tape' && node.source_id) {
                                            const tape = await base44.entities.Tape.get(node.source_id);
                                            output = tape?.snapshot_data || {};
                                        } else if (node.type === 'router') {
                                            output = { routed: true, input: nodeInput };
                                        }
                                        
                                        execResults[node.id] = output;
                                        execLog.push({ node: node.id, status: 'success' });
                                    } catch (err) {
                                        execLog.push({ node: node.id, status: 'error', error: err.message });
                                    }
                                }
                                
                                await base44.entities.BrainPipeline.update(pipeline.id, {
                                    last_run: new Date().toISOString(),
                                    run_count: (pipeline.run_count || 0) + 1
                                });
                                
                                executionResult = { results: execResults, log: execLog };
                            }
                            
                            results.push({
                                pipeline_id: pipeline.id,
                                pipeline_name: pipeline.name,
                                trigger: trigger.event,
                                executed: execute,
                                execution: executionResult
                            });
                        }
                    }
                }
                
                return Response.json({
                    success: true,
                    event: eventType,
                    matched: results.length,
                    results
                });
            }
            
            // ADD TRIGGER to pipeline
            case 'addTrigger': {
                const { pipelineId, event, conditions = {}, schedule = null, enabled = true } = params;
                
                const pipeline = await base44.entities.BrainPipeline.get(pipelineId);
                if (!pipeline) {
                    return Response.json({ error: 'Pipeline not found' }, { status: 404 });
                }
                
                const newTrigger = {
                    id: `trigger_${Date.now()}`,
                    event,
                    enabled,
                    conditions,
                    schedule
                };
                
                const triggers = [...(pipeline.triggers || []), newTrigger];
                
                await base44.entities.BrainPipeline.update(pipelineId, { triggers });
                
                return Response.json({
                    success: true,
                    trigger: newTrigger,
                    message: `Added ${event} trigger to pipeline`
                });
            }
            
            // REMOVE TRIGGER
            case 'removeTrigger': {
                const { pipelineId, triggerId } = params;
                
                const pipeline = await base44.entities.BrainPipeline.get(pipelineId);
                if (!pipeline) {
                    return Response.json({ error: 'Pipeline not found' }, { status: 404 });
                }
                
                const triggers = (pipeline.triggers || []).filter(t => t.id !== triggerId);
                await base44.entities.BrainPipeline.update(pipelineId, { triggers });
                
                return Response.json({ success: true, message: 'Trigger removed' });
            }
            
            // TOGGLE TRIGGER
            case 'toggleTrigger': {
                const { pipelineId, triggerId } = params;
                
                const pipeline = await base44.entities.BrainPipeline.get(pipelineId);
                if (!pipeline) {
                    return Response.json({ error: 'Pipeline not found' }, { status: 404 });
                }
                
                const triggers = (pipeline.triggers || []).map(t => 
                    t.id === triggerId ? { ...t, enabled: !t.enabled } : t
                );
                await base44.entities.BrainPipeline.update(pipelineId, { triggers });
                
                const trigger = triggers.find(t => t.id === triggerId);
                
                return Response.json({ 
                    success: true, 
                    enabled: trigger?.enabled,
                    message: `Trigger ${trigger?.enabled ? 'enabled' : 'disabled'}` 
                });
            }
            
            // PING NODE (API route communication)
            case 'pingNode': {
                const { pipelineId, nodeId, data = {} } = params;
                
                const pipeline = await base44.entities.BrainPipeline.get(pipelineId);
                if (!pipeline) {
                    return Response.json({ error: 'Pipeline not found' }, { status: 404 });
                }
                
                const node = pipeline.nodes.find(n => n.id === nodeId);
                if (!node) {
                    return Response.json({ error: 'Node not found' }, { status: 404 });
                }
                
                // Get node data
                let response = { node_id: nodeId, type: node.type, timestamp: new Date().toISOString() };
                
                if (node.type === 'brain') {
                    const brain = await base44.entities.Brain.get(node.source_id);
                    response.data = brain ? scxq2Decompress(brain.model_files?.snapshot || {}) : null;
                } else if (node.type === 'tape') {
                    const tape = await base44.entities.Tape.get(node.source_id);
                    response.data = tape ? scxq2Decompress(tape.snapshot_data) : null;
                }
                
                response.input = data;
                
                return Response.json({ success: true, response });
            }
            
            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('TapeManager error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});