#!/usr/bin/env python3
import trimesh
import numpy as np
from fast_simplification import simplify
from scipy.spatial import cKDTree
from trimesh.visual import TextureVisuals

src = 'public/models/camisa.glb'
m = trimesh.load(src, force='mesh')
print(f'Original: {len(m.vertices)} vértices, {len(m.faces)} caras')

# Soldar vértices duplicados (Trellis usa vertex splitting por islas UV)
m.merge_vertices()
m.update_faces(m.nondegenerate_faces())
m.remove_unreferenced_vertices()
print(f'Tras soldar: {len(m.vertices)} vértices, {len(m.faces)} caras')

orig_uvs = m.visual.uv if hasattr(m.visual, 'uv') else None
orig_mat = m.visual.material if hasattr(m.visual, 'material') else None

# Diezmar (ligero, sin pyvista)
v, f = simplify(m.vertices, m.faces, target_count=6000)
print(f'Diezmado: {len(v)} vértices, {len(f)} caras')

# Mapear UVs originales a los vértices diezmados (vecino más cercano)
new_uvs = None
if orig_uvs is not None:
    tree = cKDTree(m.vertices)
    _, idx = tree.query(v)
    new_uvs = orig_uvs[idx]

new = trimesh.Trimesh(vertices=v, faces=f, process=False)
if new_uvs is not None:
    new.visual = TextureVisuals(uv=new_uvs, material=orig_mat)

out = 'public/models/camisa_low.glb'
new.export(out)
print(f'Guardado: {out}')

chk = trimesh.load(out, force='mesh')
print(f'Verificado: {len(chk.vertices)} vértices, {len(chk.faces)} caras, uvs={chk.visual.uv is not None}')
