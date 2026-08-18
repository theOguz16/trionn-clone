import * as THREE from "three";

export type HeroSurfaceState = {
  time: number;
  charge: number;
  flash: number;
  coreWorld: THREE.Vector3;
};

export type HeroSurfaceController = {
  material: THREE.MeshPhysicalMaterial;
  update(state: HeroSurfaceState): void;
};

export function createHeroSurfaceMaterial(
  source: THREE.MeshStandardMaterial,
): HeroSurfaceController {
  const material =
    new THREE.MeshPhysicalMaterial({
      /*
       * The temporary GLB carries
       * strong brown/copper base maps.
       * Trionn's actual hero is much
       * closer to graphite, so keep
       * structural maps but remove
       * baked albedo/emissive colour.
       */
      map: null,

      normalMap:
        source.normalMap,

      normalMapType:
        source.normalMapType,

      normalScale:
        source.normalScale.clone(),

      roughnessMap:
        source.roughnessMap,

      metalnessMap:
        source.metalnessMap,

      aoMap:
        source.aoMap,

      aoMapIntensity:
        source.aoMapIntensity,

      lightMap:
        source.lightMap,

      lightMapIntensity:
        source.lightMapIntensity,

      emissiveMap: null,

      alphaMap:
        source.alphaMap,

      side:
        source.side,

      alphaTest:
        source.alphaTest,

      vertexColors:
        source.vertexColors,

      depthTest:
        source.depthTest,

      depthWrite:
        source.depthWrite,
    });

  material.color.set(
    0x080a0d,
  );

  material.metalness =
    0.72;

  material.roughness =
    0.22;

  material.envMapIntensity =
    3;

  material.clearcoat =
    1;

  material.clearcoatRoughness =
    0.05;

  material.transmission =
    0.35;

  material.ior =
    1.45;

  material.thickness =
    0.1;

  material.attenuationDistance =
    0.62;

  material.attenuationColor.set(
    0x0b0f16,
  );

  material.specularIntensity =
    1;

  material.specularColor.set(
    0xcfd7e4,
  );

  material.emissive.set(
    0x000000,
  );

  material.emissiveIntensity =
    1;

  material.transparent =
    false;

  material.opacity =
    1;

  material.name =
    `${source.name || "hero"}-surface`;

  material.userData = {
    ...source.userData,
  };

  const uniforms = {
    time: {
      value: 0,
    },

    charge: {
      value: 0,
    },

    flash: {
      value: 0,
    },

    coreWorld: {
      value:
        new THREE.Vector3(),
    },
  };

  material.onBeforeCompile =
    (shader) => {
      shader.uniforms.uHeroTime =
        uniforms.time;

      shader.uniforms.uHeroCharge =
        uniforms.charge;

      shader.uniforms.uHeroFlash =
        uniforms.flash;

      shader.uniforms.uHeroCoreWorld =
        uniforms.coreWorld;

      shader.vertexShader =
        shader.vertexShader.replace(
          "varying vec3 vViewPosition;",
          `
varying vec3 vViewPosition;
varying vec3 vHeroWorldPosition;
          `,
        );

      shader.vertexShader =
        shader.vertexShader.replace(
          "#include <project_vertex>",
          `
#include <project_vertex>

vHeroWorldPosition =
  (
    modelMatrix *
    vec4(transformed, 1.0)
  ).xyz;
          `,
        );

      shader.fragmentShader =
        shader.fragmentShader.replace(
          "varying vec3 vViewPosition;",
          `
varying vec3 vViewPosition;
varying vec3 vHeroWorldPosition;

uniform float uHeroTime;
uniform float uHeroCharge;
uniform float uHeroFlash;
uniform vec3 uHeroCoreWorld;
          `,
        );

      shader.fragmentShader =
        shader.fragmentShader.replace(
          "#include <emissivemap_fragment>",
          `
#include <emissivemap_fragment>

float heroDistance =
  length(
    vHeroWorldPosition -
    uHeroCoreWorld
  );

float heroOuterRadius =
  1.45 +
  uHeroCharge * 0.26;

float heroMidRadius =
  0.92 +
  uHeroCharge * 0.22;

float heroCoreRadius =
  0.46 +
  uHeroCharge * 0.18;

float heroOuter =
  1.0 -
  smoothstep(
    0.62,
    heroOuterRadius,
    heroDistance
  );

float heroMid =
  1.0 -
  smoothstep(
    0.29,
    heroMidRadius,
    heroDistance
  );

float heroCore =
  1.0 -
  smoothstep(
    0.06,
    heroCoreRadius,
    heroDistance
  );

float heroPulse =
  0.96 +
  0.04 *
  sin(
    uHeroTime * 2.0 +
    heroDistance * 7.0
  );

float heroEnergy =
  clamp(
    0.11 +
    uHeroCharge * 1.02 +
    uHeroFlash * 0.035,
    0.0,
    1.2
  );

vec3 heroDeepOrange =
  vec3(
    0.40,
    0.012,
    0.001
  );

vec3 heroOrange =
  vec3(
    1.0,
    0.17,
    0.004
  );

vec3 heroHotOrange =
  vec3(
    1.0,
    0.44,
    0.035
  );

vec3 heroWhiteHot =
  vec3(
    1.0,
    0.86,
    0.66
  );

vec3 heroWarmColor =
  mix(
    heroDeepOrange,
    heroOrange,
    smoothstep(
      0.16,
      0.82,
      heroMid
    )
  );

heroWarmColor =
  mix(
    heroWarmColor,
    heroHotOrange,
    heroCore * 0.72
  );

float heroWhiteAmount =
  pow(
    heroCore,
    2.8
  ) *
  smoothstep(
    0.18,
    0.92,
    uHeroCharge
  );

heroWarmColor =
  mix(
    heroWarmColor,
    heroWhiteHot,
    clamp(
      heroWhiteAmount,
      0.0,
      1.0
    )
  );

float heroMask =
  (
    heroOuter * 0.045 +
    heroMid * 0.24 +
    heroCore * 0.88
  ) *
  heroEnergy *
  heroPulse;

totalEmissiveRadiance +=
  heroWarmColor *
  heroMask;
          `,
        );
    };

  material.customProgramCacheKey =
    () =>
      "trionn-hero-surface-lock-v2";

  material.needsUpdate =
    true;

  return {
    material,

    update(
      state,
    ) {
      const charge =
        THREE.MathUtils.clamp(
          state.charge,
          0,
          1,
        );

      const flash =
        THREE.MathUtils.clamp(
          state.flash,
          0,
          1,
        );

      uniforms.time.value =
        state.time;

      uniforms.charge.value =
        charge;

      uniforms.flash.value =
        flash;

      uniforms.coreWorld.value.copy(
        state.coreWorld,
      );

      /*
       * Material-only panel hover.
       * Geometry does not move.
       */
      material.envMapIntensity =
        3 +
        flash *
          1.6;

      material.clearcoatRoughness =
        Math.max(
          0.015,
          0.05 -
            flash *
              0.035,
        );

      material.transmission =
        Math.min(
          0.67,
          0.35 +
            flash *
              0.32,
        );
    },
  };
}