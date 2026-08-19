import * as THREE from "three";

import {
  GLTFLoader,
} from "three/addons/loaders/GLTFLoader.js";

import {
  createHeroSurfaceMaterial,
  type HeroSurfaceController,
} from "./HeroSurfaceMaterial";

type HeroMeshState = {
  mesh: THREE.Mesh;

  basePosition:
    THREE.Vector3;

  baseQuaternion:
    THREE.Quaternion;

  scrollDir:
    THREE.Vector3;

  blastDir:
    THREE.Vector3;

  spinAxis:
    THREE.Vector3;

  spinSpeed: number;

  delay: number;

  scrollScale: number;

  phase: number;

  flash: number;

  surfaces:
    HeroSurfaceController[];
};

function seeded01(
  index: number,
  salt: number,
) {
  const value =
    Math.sin(
      (
        index +
        1
      ) *
        12.9898 +
        salt *
          78.233,
    ) *
    43758.5453;

  return (
    value -
    Math.floor(
      value,
    )
  );
}

function createSeededDirection(
  index: number,
) {
  const direction =
    new THREE.Vector3(
      seeded01(
        index,
        3,
      ) *
        2 -
        1,

      seeded01(
        index,
        7,
      ) *
        2 -
        1,

      seeded01(
        index,
        11,
      ) *
        2 -
        1,
    );

  if (
    direction.lengthSq() <
    0.001
  ) {
    direction.set(
      1,
      0,
      0,
    );
  }

  return direction.normalize();
}

export class HeroModel {
  readonly root =
    new THREE.Group();

  meshes:
    THREE.Mesh[] = [];

  private readonly states:
    HeroMeshState[] = [];

  private readonly stateByMesh =
    new WeakMap<
      THREE.Mesh,
      HeroMeshState
    >();

  private readonly geometries =
    new Set<
      THREE.BufferGeometry
    >();

  private readonly materials =
    new Set<
      THREE.Material
    >();

  private guideAnchorsLocal = [
    new THREE.Vector3(
      -0.7,
      -0.2,
      0.1,
    ),

    new THREE.Vector3(
      0.7,
      0.18,
      0.1,
    ),

    new THREE.Vector3(
      0,
      -0.75,
      0.1,
    ),
  ];

  async load(
    url: string,
  ) {
    const loader =
      new GLTFLoader();

    const gltf =
      await loader.loadAsync(
        url,
      );

    this.destroy();

    const sourceRoot =
      gltf.scene;

    sourceRoot.updateMatrixWorld(
      true,
    );

    const initialBox =
      new THREE.Box3()
        .setFromObject(
          sourceRoot,
        );

    const initialSize =
      initialBox.getSize(
        new THREE.Vector3(),
      );

    const initialCenter =
      initialBox.getCenter(
        new THREE.Vector3(),
      );

    const largestAxis =
      Math.max(
        initialSize.x,
        initialSize.y,
        initialSize.z,
        0.0001,
      );

    /*
     * Normalise the temporary GLB
     * before flattening its meshes.
     */
    const normalisedScale =
      3.42 /
      largestAxis;

    sourceRoot.scale.setScalar(
      normalisedScale,
    );

    sourceRoot.position.set(
      -initialCenter.x *
        normalisedScale,

      -initialCenter.y *
        normalisedScale,

      -initialCenter.z *
        normalisedScale,
    );

    sourceRoot.updateMatrixWorld(
      true,
    );

    const normalisedBox =
      new THREE.Box3()
        .setFromObject(
          sourceRoot,
        );

    const normalisedSize =
      normalisedBox.getSize(
        new THREE.Vector3(),
      );

    const normalisedCenter =
      normalisedBox.getCenter(
        new THREE.Vector3(),
      );

    const sourceMeshes:
      THREE.Mesh[] = [];

    sourceRoot.traverse(
      (
        object,
      ) => {
        if (
          object instanceof
          THREE.Mesh
        ) {
          sourceMeshes.push(
            object,
          );
        }
      },
    );

    const panelMeshes:
      THREE.Mesh[] = [];

    sourceMeshes.forEach(
      (
        sourceMesh,
        index,
      ) => {
        /*
         * Bake the source hierarchy
         * into geometry, then center
         * each part around its own
         * pivot.
         *
         * Result: identical assembled
         * model, cleaner deterministic
         * explosion.
         */
        const geometry =
          sourceMesh.geometry
            .clone();

        geometry.applyMatrix4(
          sourceMesh.matrixWorld,
        );

        geometry.computeBoundingBox();

        const box =
          geometry.boundingBox;

        if (!box) {
          geometry.dispose();

          return;
        }

        const center =
          box.getCenter(
            new THREE.Vector3(),
          );

        geometry.translate(
          -center.x,
          -center.y,
          -center.z,
        );

        geometry.computeBoundingSphere();

        const sourceMaterials =
          Array.isArray(
            sourceMesh.material,
          )
            ? sourceMesh.material
            : [
                sourceMesh.material,
              ];

        const controllers:
          HeroSurfaceController[] =
          [];

        const nextMaterials =
          sourceMaterials.map(
            (
              sourceMaterial,
            ) => {
              if (
                sourceMaterial instanceof
                THREE.MeshStandardMaterial
              ) {
                const controller =
                  createHeroSurfaceMaterial(
                    sourceMaterial,
                  );

                controllers.push(
                  controller,
                );

                this.materials.add(
                  controller.material,
                );

                return controller.material;
              }

              const clone =
                sourceMaterial.clone();

              const maybeColor =
                clone as THREE.Material & {
                  color?: THREE.Color;
                };

              if (
                maybeColor.color
              ) {
                maybeColor.color.set(
                  0x090b0e,
                );
              }

              this.materials.add(
                clone,
              );

              return clone;
            },
          );

        const material =
          Array.isArray(
            sourceMesh.material,
          )
            ? nextMaterials
            : nextMaterials[0];

        const mesh =
          new THREE.Mesh(
            geometry,
            material,
          );

        mesh.name =
          sourceMesh.name ||
          `hero-panel-${index}`;

        mesh.position.copy(
          center,
        );

        mesh.castShadow =
          false;

        mesh.receiveShadow =
          false;

        mesh.frustumCulled =
          false;

        mesh.renderOrder =
          sourceMesh.renderOrder;

        mesh.userData = {
          ...sourceMesh.userData,
        };

        this.root.add(
          mesh,
        );

        this.geometries.add(
          geometry,
        );

        /*
         * Radial direction keeps a coherent relationship to the assembled
         * symbol. The actual scroll narrative now blends this with the same
         * seeded blast direction used by Hold-to-Blast.
         */
        const radial =
          center
            .clone()
            .sub(
              normalisedCenter,
            );

        if (
          radial.lengthSq() <
          0.01
        ) {
          const angle =
            seeded01(
              index,
              23,
            ) *
            Math.PI *
            2;

          radial.set(
            Math.cos(
              angle,
            ),

            Math.sin(
              angle,
            ),

            0,
          );
        }

        radial.z *=
          0.16;

        radial.normalize();

        const randomDir =
          createSeededDirection(
            index,
          );

        /*
         * Hold-to-Blast direction: radial enough to read as the object
         * exploding from its core, random enough for every panel to break
         * apart independently.
         */
        const blastDir =
          radial
            .clone()
            .multiplyScalar(
              0.58,
            )
            .addScaledVector(
              randomDir,
              0.42,
            )
            .normalize();

        const spinAxis =
          createSeededDirection(
            index +
              101,
          );

        const state:
          HeroMeshState = {
          mesh,

          basePosition:
            center.clone(),

          baseQuaternion:
            mesh.quaternion.clone(),

          scrollDir:
            radial.clone(),

          blastDir,

          spinAxis,

          spinSpeed:
            0.28 +
            seeded01(
              index,
              31,
            ) *
              0.42,

          delay:
            seeded01(
              index,
              41,
            ) *
            0.11,

          scrollScale:
            0.78 +
            seeded01(
              index,
              47,
            ) *
              0.3,

          phase:
            Math.atan2(
              center.y,
              center.x,
            ),

          flash:
            0,

          surfaces:
            controllers,
        };

        this.states.push(
          state,
        );

        this.stateByMesh.set(
          mesh,
          state,
        );

        if (
          !/edge|wire|outline/i.test(
            mesh.name,
          )
        ) {
          panelMeshes.push(
            mesh,
          );
        }
      },
    );

    this.meshes =
      panelMeshes.length >
      0
        ? panelMeshes
        : this.states.map(
            (
              state,
            ) =>
              state.mesh,
          );

    const halfX =
      normalisedSize.x *
      0.5;

    const halfY =
      normalisedSize.y *
      0.5;

    const halfZ =
      normalisedSize.z *
      0.5;

    this.guideAnchorsLocal = [
      new THREE.Vector3(
        normalisedCenter.x -
          halfX *
            0.43,

        normalisedCenter.y -
          halfY *
            0.12,

        normalisedCenter.z +
          halfZ *
            0.08,
      ),

      new THREE.Vector3(
        normalisedCenter.x +
          halfX *
            0.43,

        normalisedCenter.y +
          halfY *
            0.14,

        normalisedCenter.z +
          halfZ *
            0.08,
      ),

      new THREE.Vector3(
        normalisedCenter.x -
          halfX *
            0.02,

        normalisedCenter.y -
          halfY *
            0.44,

        normalisedCenter.z +
          halfZ *
            0.08,
      ),
    ];

    sourceMeshes.forEach(
      (
        mesh,
      ) => {
        mesh.geometry.dispose();

        const sourceMaterials =
          Array.isArray(
            mesh.material,
          )
            ? mesh.material
            : [
                mesh.material,
              ];

        sourceMaterials.forEach(
          (
            material,
          ) => {
            material.dispose();
          },
        );
      },
    );
  }

  flashMesh(
    mesh: THREE.Mesh,
  ) {
    const state =
      this.stateByMesh.get(
        mesh,
      );

    if (!state) {
      return;
    }

    state.flash =
      1;
  }

  getGuideAnchorWorldPositions() {
    this.root.updateWorldMatrix(
      true,
      false,
    );

    return this.guideAnchorsLocal.map(
      (
        anchor,
      ) =>
        this.root.localToWorld(
          anchor.clone(),
        ),
    );
  }

  update(
    time: number,
    delta: number,
    scrollAmount: number,
    blastAmount: number,
    charge: number,
    coreWorld: THREE.Vector3,
  ) {
    const scrollDrive =
      THREE.MathUtils.clamp(
        scrollAmount,
        0,
        1,
      );

    const blastDrive =
      THREE.MathUtils.clamp(
        blastAmount,
        0,
        1,
      );

    const activity =
      Math.max(
        scrollDrive,
        blastDrive,
      );

    for (
      const state of
      this.states
    ) {
      const {
        mesh,
      } = state;

      state.flash *=
        Math.pow(
          0.92,
          delta *
            60,
        );

      /*
       * Narrative scroll explosion.
       *
       * Use the same per-panel delay profile as Hold-to-Blast so every
       * actual mesh participates, but shape the progress with smoothstep so
       * reversing scroll naturally pulls every piece back into place.
       */
      const scrollStart =
        state.delay;

      const scrollLocal =
        THREE.MathUtils.clamp(
          (
            scrollDrive -
            scrollStart
          ) /
            Math.max(
              0.001,
              1 -
                scrollStart,
            ),
          0,
          1,
        );

      const scrollAmt =
        scrollLocal *
        scrollLocal *
        (
          3 -
          2 *
            scrollLocal
        );

      const blastLocal =
        THREE.MathUtils.clamp(
          (
            blastDrive -
            state.delay
          ) /
            Math.max(
              0.001,
              1 -
                state.delay,
            ),
          0,
          1,
        );

      /*
       * The previous narrative scroll only moved panels ~1.12 units and
       * mostly along a flat radial direction. That read as a diagrammatic
       * separation rather than an explosion.
       *
       * Drive scroll through the SAME blastDir used by Hold-to-Blast. A
       * small radial term keeps the silhouette coherent, while 4.45 units
       * gives a genuine all-parts blast without throwing the temporary GLB
       * so far away that the About composition becomes unreadable.
       */
      const narrativeDistance =
        scrollAmt *
        state.scrollScale *
        4.45;

      const narrativeRadialDistance =
        scrollAmt *
        state.scrollScale *
        0.34;

      const blastDistance =
        blastLocal *
        5.5;

      const driftScale =
        1 -
        THREE.MathUtils.clamp(
          activity,
          0,
          1,
        );

      const driftX =
        Math.sin(
          time *
            0.4 +
            state.phase,
        ) *
        0.012 *
        driftScale;

      const driftY =
        Math.cos(
          time *
            0.35 +
            state.phase,
        ) *
        0.008 *
        driftScale;

      const driftZ =
        Math.sin(
          time *
            0.3 +
            state.phase *
              1.5,
        ) *
        0.006 *
        driftScale;

      mesh.position
        .copy(
          state.basePosition,
        )
        .addScaledVector(
          state.blastDir,
          narrativeDistance,
        )
        .addScaledVector(
          state.scrollDir,
          narrativeRadialDistance,
        )
        .addScaledVector(
          state.blastDir,
          blastDistance,
        );

      mesh.position.x +=
        driftX;

      mesh.position.y +=
        driftY;

      mesh.position.z +=
        driftZ;

      /*
       * Narrative scroll now inherits most of the dramatic Hold-to-Blast
       * rotation as well. Because the same scrollAmt is reversible, the
       * rotations unwind cleanly during the About rejoin.
       */
      const spinAmount =
        scrollAmt *
          state.spinSpeed *
          Math.PI *
          0.78 +
        blastLocal *
          state.spinSpeed *
          Math.PI;

      mesh.quaternion.copy(
        state.baseQuaternion,
      );

      if (
        spinAmount !==
        0
      ) {
        const spin =
          new THREE.Quaternion()
            .setFromAxisAngle(
              state.spinAxis,
              spinAmount,
            );

        mesh.quaternion.multiply(
          spin,
        );
      }

      for (
        const surface of
        state.surfaces
      ) {
        surface.update({
          time,
          charge,
          flash:
            state.flash,
          coreWorld,
        });
      }
    }
  }

  destroy() {
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

    this.geometries.clear();

    this.materials.clear();

    this.states.length =
      0;

    this.meshes =
      [];

    this.root.clear();
  }
}
