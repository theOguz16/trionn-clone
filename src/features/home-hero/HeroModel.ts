import * as THREE from "three";

import {
  GLTFLoader,
} from "three/addons/loaders/GLTFLoader.js";

type HeroMeshState = {
  position:
    THREE.Vector3;

  rotation:
    THREE.Euler;

  scale:
    THREE.Vector3;

  explodeDirection:
    THREE.Vector3;

  spinAxis:
    THREE.Vector3;

  spinSpeed:
    number;

  delay:
    number;

  phase:
    number;

  flash:
    number;
};

type MaterialState = {
  roughness?:
    number;

  emissiveIntensity?:
    number;

  clearcoatRoughness?:
    number;

  transmission?:
    number;
};

export class HeroModel {
  readonly root =
    new THREE.Group();

  readonly meshes:
    THREE.Mesh[] = [];

  private readonly geometries =
    new Set<
      THREE.BufferGeometry
    >();

  private readonly materials =
    new Set<
      THREE.Material
    >();

  private readonly meshStates =
    new WeakMap<
      THREE.Mesh,
      HeroMeshState
    >();

  private readonly materialStates =
    new WeakMap<
      THREE.Material,
      MaterialState
    >();

  private destroyed =
    false;

  async load(
    url: string,
  ) {
    const loader =
      new GLTFLoader();

    const gltf =
      await loader
        .loadAsync(
          url,
        );

    if (
      this.destroyed
    ) {
      return;
    }

    const model =
      gltf.scene;

    // -------------------------
    // NORMALIZE
    // -------------------------

    const bounds =
      new THREE.Box3()
        .setFromObject(
          model,
        );

    const size =
      bounds.getSize(
        new THREE.Vector3(),
      );

    const center =
      bounds.getCenter(
        new THREE.Vector3(),
      );

    model.position.sub(
      center,
    );

    const largestAxis =
      Math.max(
        size.x,
        size.y,
        size.z,
      );

    if (
      largestAxis > 0
    ) {
      model.scale
        .multiplyScalar(
          2.7 /
            largestAxis,
        );
    }

    this.root.add(
      model,
    );

    this.root
      .updateMatrixWorld(
        true,
      );

    const discoveredMeshes:
      THREE.Mesh[] = [];

    model.traverse(
      (
        child,
      ) => {
        if (
          child instanceof
          THREE.Mesh
        ) {
          discoveredMeshes
            .push(
              child,
            );
        }
      },
    );

    const total =
      Math.max(
        discoveredMeshes
          .length,
        1,
      );

    discoveredMeshes
      .forEach(
        (
          mesh,
          index,
        ) => {
          this.prepareMesh(
            mesh,
            index,
            total,
          );
        },
      );
  }

  private prepareMesh(
    mesh: THREE.Mesh,
    index: number,
    total: number,
  ) {
    this.meshes.push(
      mesh,
    );

    this.geometries.add(
      mesh.geometry,
    );

    if (
      Array.isArray(
        mesh.material,
      )
    ) {
      mesh.material =
        mesh.material.map(
          (
            material,
          ) =>
            this.prepareMaterial(
              material,
            ),
        );
    } else {
      mesh.material =
        this.prepareMaterial(
          mesh.material,
        );
    }

    const explodeDirection =
      this.calculateExplodeDirection(
        mesh,
        index,
      );

    const spinAxis =
      this.calculateSpinAxis(
        index,
      );

    /*
     * Trionn panel explosion'ında
     * her panel aynı anda başlamıyor.
     */
    const delay =
      total <= 1
        ? 0
        : (
            index /
            (
              total -
              1
            )
          ) *
          0.12;

    const spinSpeed =
      0.8 +
      this.seededRandom(
        index +
          17,
      ) *
        1.4;

    const phase =
      (
        index %
        3
      ) *
      (
        Math.PI *
        2 /
        3
      );

    this.meshStates.set(
      mesh,
      {
        position:
          mesh.position
            .clone(),

        rotation:
          mesh.rotation
            .clone(),

        scale:
          mesh.scale
            .clone(),

        explodeDirection,

        spinAxis,

        spinSpeed,

        delay,

        phase,

        flash: 0,
      },
    );
  }

  private prepareMaterial(
    source:
      THREE.Material,
  ) {
    const material =
      source.clone();

    this.materials.add(
      material,
    );

    if (
      material instanceof
      THREE.MeshStandardMaterial
    ) {
      material
        .envMapIntensity =
        3;

      material.roughness =
        Math.min(
          material
            .roughness,
          0.28,
        );

      const state:
        MaterialState = {
          roughness:
            material
              .roughness,

          emissiveIntensity:
            material
              .emissiveIntensity,
        };

      if (
        material instanceof
        THREE.MeshPhysicalMaterial
      ) {
        material.clearcoat =
          Math.max(
            material
              .clearcoat,
            0.4,
          );

        material
          .clearcoatRoughness =
          0.05;

        material.transmission =
          Math.max(
            material
              .transmission,
            0.35,
          );

        state
          .clearcoatRoughness =
          material
            .clearcoatRoughness;

        state
          .transmission =
          material
            .transmission;
      }

      this.materialStates.set(
        material,
        state,
      );
    }

    return material;
  }

  flashMesh(
    mesh: THREE.Mesh,
  ) {
    const state =
      this.meshStates.get(
        mesh,
      );

    if (!state) {
      return;
    }

    state.flash =
      1;
  }

  private calculateExplodeDirection(
    mesh: THREE.Mesh,
    index: number,
  ) {
    const parent =
      mesh.parent;

    if (!parent) {
      return this
        .fallbackDirection(
          index,
        );
    }

    const meshWorld =
      mesh.getWorldPosition(
        new THREE.Vector3(),
      );

    const centerWorld =
      this.root
        .getWorldPosition(
          new THREE.Vector3(),
        );

    const meshLocal =
      parent.worldToLocal(
        meshWorld.clone(),
      );

    const centerLocal =
      parent.worldToLocal(
        centerWorld.clone(),
      );

    const direction =
      meshLocal.sub(
        centerLocal,
      );

    if (
      direction
        .lengthSq() <
      0.0001
    ) {
      return this
        .fallbackDirection(
          index,
        );
    }

    return direction
      .normalize();
  }

  private fallbackDirection(
    index: number,
  ) {
    const angle =
      index *
      2.3999632297;

    const z =
      Math.sin(
        (
          index +
          1
        ) *
          1.731,
      ) *
      0.55;

    const radial =
      Math.sqrt(
        Math.max(
          0,
          1 -
            z *
              z,
        ),
      );

    return new THREE.Vector3(
      Math.cos(
        angle,
      ) *
        radial,

      Math.sin(
        angle,
      ) *
        radial,

      z,
    ).normalize();
  }

  private calculateSpinAxis(
    index: number,
  ) {
    return new THREE.Vector3(
      Math.sin(
        index *
          1.7 +
          0.3,
      ),

      Math.cos(
        index *
          1.3 +
          0.8,
      ),

      Math.sin(
        index *
          0.9 +
          1.1,
      ),
    ).normalize();
  }

  private seededRandom(
    seed: number,
  ) {
    const value =
      Math.sin(
        seed *
          12.9898,
      ) *
      43758.5453;

    return (
      value -
      Math.floor(
        value,
      )
    );
  }

  private updateMaterialFlash(
    material:
      | THREE.Material
      | THREE.Material[],
    flash: number,
  ) {
    const materials =
      Array.isArray(
        material,
      )
        ? material
        : [
            material,
          ];

    for (
      const current of
      materials
    ) {
      if (
        !(
          current instanceof
          THREE.MeshStandardMaterial
        )
      ) {
        continue;
      }

      const state =
        this.materialStates
          .get(
            current,
          );

      if (!state) {
        continue;
      }

      /*
       * Bunlar Trionn'ın
       * yayınladığı hover
       * charge değerleri.
       */
      current
        .envMapIntensity =
        3 +
        flash *
          1.6;

      if (
        current instanceof
        THREE.MeshPhysicalMaterial
      ) {
        current
          .clearcoatRoughness =
          Math.max(
            0.01,
            0.05 -
              flash *
                0.035,
          );

        current
          .transmission =
          Math.min(
            1,
            0.35 +
              flash *
                0.32,
          );
      } else {
        const baseRoughness =
          state
            .roughness ??
          0.28;

        current.roughness =
          Math.max(
            0.04,
            baseRoughness -
              flash *
                0.08,
          );

        const baseEmissive =
          state
            .emissiveIntensity ??
          0;

        current
          .emissiveIntensity =
          baseEmissive +
          flash *
            0.15;
      }
    }
  }

  update(
    time: number,
    delta: number,
    explodeAmount: number,
  ) {
    const explode =
      THREE.MathUtils.clamp(
        explodeAmount,
        0,
        1,
      );

    const driftAmount =
      1 -
      explode;

    /*
     * Orijinal kod yaklaşık
     * frame başına 0.92 decay.
     * Delta-time bağımsız hale
     * getiriyoruz.
     */
    const flashDecay =
      Math.pow(
        0.92,
        delta *
          60,
      );

    for (
      const mesh of
      this.meshes
    ) {
      const state =
        this.meshStates
          .get(
            mesh,
          );

      if (!state) {
        continue;
      }

      state.flash *=
        flashDecay;

      const amount =
        Math.max(
          0,
          explode -
            state.delay,
        );

      /*
       * Trionn'ın yayınladığı
       * explosion multiplier.
       */
      const burst =
        amount *
        5.5;

      const driftX =
        Math.sin(
          time *
            0.4 +
            state.phase,
        ) *
        0.012 *
        driftAmount;

      const driftY =
        Math.cos(
          time *
            0.35 +
            state.phase,
        ) *
        0.008 *
        driftAmount;

      const driftZ =
        Math.sin(
          time *
            0.3 +
            state.phase *
              1.5,
        ) *
        0.006 *
        driftAmount;

      mesh.position.set(
        state
          .position.x +
          state
            .explodeDirection
            .x *
            burst +
          driftX,

        state
          .position.y +
          state
            .explodeDirection
            .y *
            burst +
          driftY,

        state
          .position.z +
          state
            .explodeDirection
            .z *
            burst +
          driftZ,
      );

      mesh.rotation.set(
        state
          .rotation.x +
          state
            .spinAxis.x *
            state
              .spinSpeed *
            amount *
            Math.PI,

        state
          .rotation.y +
          state
            .spinAxis.y *
            state
              .spinSpeed *
            amount *
            Math.PI,

        state
          .rotation.z +
          state
            .spinAxis.z *
            state
              .spinSpeed *
            amount *
            Math.PI,
      );

      mesh.scale.copy(
        state.scale,
      );

      this.updateMaterialFlash(
        mesh.material,
        state.flash,
      );
    }
  }

  destroy() {
    this.destroyed =
      true;

    for (
      const geometry of
      this.geometries
    ) {
      geometry.dispose();
    }

    for (
      const material of
      this.materials
    ) {
      material.dispose();
    }

    this.meshes.length =
      0;

    this.root.clear();
  }
}