#!/usr/bin/env python3
import trimesh
import numpy as np
from fast_simplification import simplify
from scipy.spatial import cKDTree
from trimesh.visual import TextureVisuals

src = 'public/models/beige_shirt.glb'
print('Cargando...')
m = trimesh.load(src, force='mesh')
print(f'Original: {len(m.vertices)} vértices, {len(m.faces)} caras')

orig_uvs = m.visual.uv if hasattr(m.visual, 'uv') else None
orig_mat = m.visual.material if hasattr(m.visual, 'material') else None

target = 40000  # caras objetivo (~20k vértices)
print('Diezmando...')
v, f = simplify(m.vertices, m.faces, target_count=target)
print(f'Diezmado: {len(v)} vértices, {len(f)} caras')

new_uvs = None
if orig_uvs is not None:
    print('Mapeando UVs...')
    tree = cKDTree(m.vertices)
    _, idx = tree.query(v)
    new_uvs = orig_uvs[idx]

new = trimesh.Trimesh(vertices=v, faces=f, process=False)
if new_uvs is not None:
    new.visual = TextureVisuals(uv=new_uvs, material=orig_mat)

out = 'public/models/beige_shirt_low.glb'
new.export(out)
print(f'Guardado: {out}')

import os
print(f'Tamaño: {os.path.getsize(out)/1e6:.2f} MB')

chk = trimesh.load(out, force='mesh')
print(f'Verificado: {len(chk.vertices)} vértices, {len(chk.faces)} caras, uvs={chk.visual.uv is not None}')
