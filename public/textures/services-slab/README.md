# Services slab texture bake

The maps in this directory are projection-baked from Poly Haven's CC0
[`rock_face_01`](https://polyhaven.com/a/rock_face_01) GLTF asset. The source
model's atlas is never bound directly to the rectangular slab at runtime.

- `desktop-*`: 2048×2048, used by medium/high desktop presets.
- `mobile-*`: 1024×1024, used on mobile and by the low preset.
- `arm`: ambient occlusion in red and roughness in green.
- Low quality does not request `height` and keeps displacement disabled.

Regenerate after downloading the Poly Haven 2K GLTF package to a source
directory:

```sh
node scripts/bake-services-slab-textures.mjs /path/to/rock_face_01/files
```
