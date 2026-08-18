import * as THREE from "three";

type ScreenPoint = {
  x: number;
  y: number;
};

type CubicPath = {
  p0: ScreenPoint;
  p1: ScreenPoint;
  p2: ScreenPoint;
  p3: ScreenPoint;
};

type WeldBolt = {
  geometries:
    THREE.BufferGeometry[];

  lines:
    THREE.Line[];

  materials:
    THREE.LineBasicMaterial[];

  life: number;
  maxLife: number;
};

type WeldUpdateResult = {
  burstStarted: boolean;
};

function clamp01(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function distanceSquared(
  a: ScreenPoint,
  b: ScreenPoint,
) {
  const dx =
    a.x -
    b.x;

  const dy =
    a.y -
    b.y;

  return (
    dx * dx +
    dy * dy
  );
}

function setPoint(
  point: ScreenPoint,
  x: number,
  y: number,
) {
  point.x =
    x;

  point.y =
    y;
}

function lerpPoint(
  a: ScreenPoint,
  b: ScreenPoint,
  t: number,
): ScreenPoint {
  return {
    x:
      a.x +
      (
        b.x -
        a.x
      ) *
        t,

    y:
      a.y +
      (
        b.y -
        a.y
      ) *
        t,
  };
}

function cubicPoint(
  path: CubicPath,
  t: number,
): ScreenPoint {
  const inv =
    1 -
    t;

  const inv2 =
    inv *
    inv;

  const t2 =
    t *
    t;

  return {
    x:
      inv2 *
        inv *
        path.p0.x +
      3 *
        inv2 *
        t *
        path.p1.x +
      3 *
        inv *
        t2 *
        path.p2.x +
      t2 *
        t *
        path.p3.x,

    y:
      inv2 *
        inv *
        path.p0.y +
      3 *
        inv2 *
        t *
        path.p1.y +
      3 *
        inv *
        t2 *
        path.p2.y +
      t2 *
        t *
        path.p3.y,
  };
}

function nearestPointOnSegment(
  point: ScreenPoint,
  start: ScreenPoint,
  end: ScreenPoint,
) {
  const dx =
    end.x -
    start.x;

  const dy =
    end.y -
    start.y;

  const lengthSquared =
    dx * dx +
    dy * dy;

  if (
    lengthSquared <=
    0.0001
  ) {
    return {
      x:
        start.x,

      y:
        start.y,
    };
  }

  const t =
    clamp01(
      (
        (
          point.x -
          start.x
        ) *
          dx +
        (
          point.y -
          start.y
        ) *
          dy
      ) /
        lengthSquared,
    );

  return {
    x:
      start.x +
      dx *
        t,

    y:
      start.y +
      dy *
        t,
  };
}

export class HeroWeldLines {
  private readonly canvas =
    document.createElement(
      "canvas",
    );

  private readonly context:
    CanvasRenderingContext2D;

  private readonly texture:
    THREE.CanvasTexture;

  private readonly baseGeometry =
    new THREE.PlaneGeometry(
      2,
      2,
    );

  private readonly baseMaterial:
    THREE.MeshBasicMaterial;

  private readonly baseScene =
    new THREE.Scene();

  private readonly baseCamera =
    new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      10,
    );

  private readonly weldScene =
    new THREE.Scene();

  private readonly paths:
    CubicPath[] = [
      {
        p0: {
          x: 0,
          y: 0,
        },

        p1: {
          x: 0,
          y: 0,
        },

        p2: {
          x: 0,
          y: 0,
        },

        p3: {
          x: 0,
          y: 0,
        },
      },

      {
        p0: {
          x: 0,
          y: 0,
        },

        p1: {
          x: 0,
          y: 0,
        },

        p2: {
          x: 0,
          y: 0,
        },

        p3: {
          x: 0,
          y: 0,
        },
      },

      {
        p0: {
          x: 0,
          y: 0,
        },

        p1: {
          x: 0,
          y: 0,
        },

        p2: {
          x: 0,
          y: 0,
        },

        p3: {
          x: 0,
          y: 0,
        },
      },
    ];

  /*
   * Curves are sampled once whenever
   * their anchors move.
   *
   * Hit testing can then stay cheap.
   */
  private readonly samples =
    Array.from(
      {
        length: 3,
      },

      () =>
        Array.from(
          {
            length: 65,
          },

          () => ({
            x: 0,
            y: 0,
          }),
        ),
    );

  private readonly anchors:
    ScreenPoint[] = [
      {
        x: 0,
        y: 0,
      },

      {
        x: 0,
        y: 0,
      },

      {
        x: 0,
        y: 0,
      },
    ];

  private readonly lineProgress = [
    0,
    0,
    0,
  ];

  private readonly lastLineProgress = [
    -1,
    -1,
    -1,
  ];

  private bolts:
    WeldBolt[] = [];

  private elapsed =
    0;

  private width =
    1;

  private height =
    1;

  private hasExternalAnchors =
    false;

  private canvasDirty =
    true;

  private lastScrollProgress =
    -1;

  private sparkWasAway =
    true;

  private sparkBurstLeft =
    0;

  private weldCooldown =
    0;

  constructor() {
    const context =
      this.canvas.getContext(
        "2d",
      );

    if (!context) {
      throw new Error(
        "Could not create hero weld canvas.",
      );
    }

    this.context =
      context;

    this.texture =
      new THREE.CanvasTexture(
        this.canvas,
      );

    this.texture.colorSpace =
      THREE.SRGBColorSpace;

    this.texture.generateMipmaps =
      false;

    this.texture.minFilter =
      THREE.LinearFilter;

    this.texture.magFilter =
      THREE.LinearFilter;

    this.baseMaterial =
      new THREE.MeshBasicMaterial({
        map:
          this.texture,

        transparent:
          true,

        depthTest:
          false,

        depthWrite:
          false,

        toneMapped:
          false,
      });

    const baseMesh =
      new THREE.Mesh(
        this.baseGeometry,
        this.baseMaterial,
      );

    baseMesh.frustumCulled =
      false;

    this.baseScene.add(
      baseMesh,
    );

    this.baseCamera.position.z =
      1;
  }

  resize(
    width: number,
    height: number,
  ) {
    this.width =
      Math.max(
        width,
        1,
      );

    this.height =
      Math.max(
        height,
        1,
      );

    /*
     * 1x remains deliberate.
     *
     * Retina-sized canvas uploads
     * were part of the old jank.
     */
    this.canvas.width =
      Math.max(
        1,
        Math.round(
          this.width,
        ),
      );

    this.canvas.height =
      Math.max(
        1,
        Math.round(
          this.height,
        ),
      );

    this.context.setTransform(
      1,
      0,
      0,
      1,
      0,
      0,
    );

    this.buildPaths();

    this.canvasDirty =
      true;
  }

  setAnchors(
    anchors:
      ScreenPoint[],
  ) {
    if (
      anchors.length <
      3
    ) {
      return;
    }

    let changed =
      !this.hasExternalAnchors;

    const threshold =
      0.42;

    const thresholdSquared =
      threshold *
      threshold;

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const current =
        this.anchors[
          index
        ];

      const next =
        anchors[
          index
        ];

      if (
        !this.hasExternalAnchors ||
        distanceSquared(
          current,
          next,
        ) >
          thresholdSquared
      ) {
        current.x =
          next.x;

        current.y =
          next.y;

        changed =
          true;
      }
    }

    this.hasExternalAnchors =
      true;

    if (!changed) {
      return;
    }

    this.buildPaths();

    this.canvasDirty =
      true;
  }

  private buildPaths() {
    const w =
      this.width;

    const h =
      this.height;

    const fallback = {
      x:
        w *
        0.57,

      y:
        h *
        0.55,
    };

    const a0 =
      this.hasExternalAnchors
        ? this.anchors[0]
        : fallback;

    const a1 =
      this.hasExternalAnchors
        ? this.anchors[1]
        : fallback;

    const a2 =
      this.hasExternalAnchors
        ? this.anchors[2]
        : fallback;

    /*
     * LOWER-LEFT SWEEP
     *
     * These control points create
     * the broad elliptical arc
     * visible around the reference
     * symbol.
     */
    setPoint(
      this.paths[0].p0,
      a0.x,
      a0.y,
    );

    setPoint(
      this.paths[0].p1,
      a0.x -
        w *
          0.11,

      a0.y +
        h *
          0.075,
    );

    setPoint(
      this.paths[0].p2,
      w *
        0.19,

      h *
        0.81,
    );

    setPoint(
      this.paths[0].p3,
      -w *
        0.045,

      h *
        0.9,
    );

    /*
     * UPPER-RIGHT SWEEP
     */
    setPoint(
      this.paths[1].p0,
      a1.x,
      a1.y,
    );

    setPoint(
      this.paths[1].p1,
      a1.x +
        w *
          0.1,

      a1.y -
        h *
          0.045,
    );

    setPoint(
      this.paths[1].p2,
      w *
        0.9,

      h *
        0.245,
    );

    setPoint(
      this.paths[1].p3,
      w *
        1.045,

      h *
        0.135,
    );

    /*
     * LOWER / WRAPPING SWEEP
     */
    setPoint(
      this.paths[2].p0,
      a2.x,
      a2.y,
    );

    setPoint(
      this.paths[2].p1,
      a2.x -
        w *
          0.055,

      a2.y +
        h *
          0.12,
    );

    setPoint(
      this.paths[2].p2,
      w *
        0.28,

      h *
        0.955,
    );

    setPoint(
      this.paths[2].p3,
      w *
        0.055,

      h *
        1.045,
    );

    this.rebuildSamples();
  }

  private rebuildSamples() {
    for (
      let pathIndex = 0;
      pathIndex < 3;
      pathIndex += 1
    ) {
      const path =
        this.paths[
          pathIndex
        ];

      const samples =
        this.samples[
          pathIndex
        ];

      for (
        let index = 0;
        index <
        samples.length;
        index += 1
      ) {
        const t =
          index /
          (
            samples.length -
            1
          );

        const point =
          cubicPoint(
            path,
            t,
          );

        samples[index].x =
          point.x;

        samples[index].y =
          point.y;
      }
    }
  }

  private updateLineProgress() {
    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const delay =
        0.72 +
        index *
          0.12;

      const progress =
        clamp01(
          (
            this.elapsed -
            delay
          ) /
            0.72,
        );

      this.lineProgress[
        index
      ] =
        progress;

      if (
        Math.abs(
          progress -
            this.lastLineProgress[
              index
            ],
        ) >
        0.001
      ) {
        this.lastLineProgress[
          index
        ] =
          progress;

        this.canvasDirty =
          true;
      }
    }
  }

  private tracePartialPath(
    path:
      CubicPath,

    progress:
      number,
  ) {
    const t =
      clamp01(
        progress,
      );

    /*
     * de Casteljau split.
     *
     * Gives us a genuine partial
     * cubic curve rather than a
     * polyline approximation.
     */
    const q0 =
      lerpPoint(
        path.p0,
        path.p1,
        t,
      );

    const q1 =
      lerpPoint(
        path.p1,
        path.p2,
        t,
      );

    const q2 =
      lerpPoint(
        path.p2,
        path.p3,
        t,
      );

    const r0 =
      lerpPoint(
        q0,
        q1,
        t,
      );

    const r1 =
      lerpPoint(
        q1,
        q2,
        t,
      );

    const end =
      lerpPoint(
        r0,
        r1,
        t,
      );

    this.context.moveTo(
      path.p0.x,
      path.p0.y,
    );

    this.context.bezierCurveTo(
      q0.x,
      q0.y,

      r0.x,
      r0.y,

      end.x,
      end.y,
    );
  }

  private drawPathLayer(
    lineWidth:
      number,

    strokeStyle:
      string,

    scrollProgress:
      number,
  ) {
    const undraw =
      clamp01(
        (
          scrollProgress -
          0.02
        ) /
          0.18,
      );

    const visible =
      1 -
      undraw;

    this.context.save();

    this.context.lineCap =
      "round";

    this.context.lineJoin =
      "round";

    this.context.lineWidth =
      lineWidth;

    this.context.strokeStyle =
      strokeStyle;

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const progress =
        this.lineProgress[
          index
        ] *
        visible;

      if (
        progress <=
        0
      ) {
        continue;
      }

      this.context.beginPath();

      this.tracePartialPath(
        this.paths[
          index
        ],
        progress,
      );

      this.context.stroke();
    }

    this.context.restore();
  }

  private drawBaseLines(
    scrollProgress:
      number,
  ) {
    const undraw =
      clamp01(
        (
          scrollProgress -
          0.02
        ) /
          0.18,
      );

    const visible =
      1 -
      undraw;

    this.context.clearRect(
      0,
      0,
      this.width,
      this.height,
    );

    /*
     * Wide soft body.
     */
    this.drawPathLayer(
      5.0,

      `rgba(70,87,116,${
        0.19 *
        visible
      })`,

      scrollProgress,
    );

    /*
     * Mid layer gives the line
     * substantially more visual mass.
     */
    this.drawPathLayer(
      2.35,

      `rgba(119,142,178,${
        0.39 *
        visible
      })`,

      scrollProgress,
    );

    /*
     * Crisp silver-blue core.
     */
    this.drawPathLayer(
      1.05,

      `rgba(190,204,226,${
        0.68 *
        visible
      })`,

      scrollProgress,
    );

    this.texture.needsUpdate =
      true;

    this.canvasDirty =
      false;
  }

  private closestPointOnSamples(
    samples:
      ScreenPoint[],

    point:
      ScreenPoint,
  ) {
    let best =
      samples[0];

    let bestDistance =
      Infinity;

    for (
      let index = 0;
      index <
      samples.length -
        1;
      index += 1
    ) {
      const candidate =
        nearestPointOnSegment(
          point,
          samples[
            index
          ],
          samples[
            index +
              1
          ],
        );

      const distance =
        distanceSquared(
          point,
          candidate,
        );

      if (
        distance <
        bestDistance
      ) {
        bestDistance =
          distance;

        best =
          candidate;
      }
    }

    return best;
  }

  private hitTest(
    pointer:
      ScreenPoint,
  ) {
    /*
     * Published Trionn value.
     */
    const tolerance =
      14;

    const toleranceSquared =
      tolerance *
      tolerance;

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const nearest =
        this.closestPointOnSamples(
          this.samples[
            index
          ],
          pointer,
        );

      if (
        distanceSquared(
          nearest,
          pointer,
        ) <=
        toleranceSquared
      ) {
        return {
          lineIndex:
            index,

          point:
            nearest,
        };
      }
    }

    return null;
  }

  private screenToWorld(
    point:
      ScreenPoint,

    camera:
      THREE.PerspectiveCamera,
  ) {
    const ndc =
      new THREE.Vector3(
        (
          point.x /
          this.width
        ) *
          2 -
          1,

        -(
          (
            point.y /
            this.height
          ) *
            2 -
          1
        ),

        0.5,
      );

    ndc.unproject(
      camera,
    );

    const direction =
      ndc
        .sub(
          camera.position,
        )
        .normalize();

    const targetZ =
      0.18;

    if (
      Math.abs(
        direction.z,
      ) <
      0.0001
    ) {
      return new THREE.Vector3(
        0,
        0,
        targetZ,
      );
    }

    const distance =
      (
        targetZ -
        camera.position.z
      ) /
      direction.z;

    return camera.position
      .clone()
      .add(
        direction.multiplyScalar(
          distance,
        ),
      );
  }

  private createBolt(
    start:
      ScreenPoint,

    end:
      ScreenPoint,

    camera:
      THREE.PerspectiveCamera,
  ) {
    const segmentCount =
      13;

    const dx =
      end.x -
      start.x;

    const dy =
      end.y -
      start.y;

    const length =
      Math.max(
        Math.sqrt(
          dx * dx +
            dy * dy,
        ),
        1,
      );

    const normalX =
      -dy /
      length;

    const normalY =
      dx /
      length;

    const screenPoints:
      ScreenPoint[] =
      [];

    for (
      let index = 0;
      index <=
      segmentCount;
      index += 1
    ) {
      const t =
        index /
        segmentCount;

      const envelope =
        Math.sin(
          t *
            Math.PI,
        );

      const jitter =
        (
          Math.random() *
            2 -
          1
        ) *
        10 *
        envelope;

      screenPoints.push({
        x:
          start.x +
          dx *
            t +
          normalX *
            jitter,

        y:
          start.y +
          dy *
            t +
          normalY *
            jitter,
      });
    }

    /*
     * Only the temporary spark is
     * jagged. Base paths stay smooth.
     */
    const offsets = [
      -3.6,
      -2.4,
      -1.2,
      0,
      1.2,
      2.4,
      3.6,
    ];

    const colors = [
      0x031f61,
      0x0756e8,
      0x27b1ff,
      0xfaffff,
      0x57dcff,
      0x0965f4,
      0x03266d,
    ];

    const opacities = [
      0.19,
      0.38,
      0.7,
      1,
      0.7,
      0.38,
      0.19,
    ];

    const geometries:
      THREE.BufferGeometry[] =
      [];

    const materials:
      THREE.LineBasicMaterial[] =
      [];

    const lines:
      THREE.Line[] =
      [];

    for (
      let index = 0;
      index <
      offsets.length;
      index += 1
    ) {
      const offset =
        offsets[
          index
        ];

      const worldPoints =
        screenPoints.map(
          (
            point,
          ) =>
            this.screenToWorld(
              {
                x:
                  point.x +
                  normalX *
                    offset,

                y:
                  point.y +
                  normalY *
                    offset,
              },

              camera,
            ),
        );

      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints(
            worldPoints,
          );

      const material =
        new THREE.LineBasicMaterial({
          color:
            colors[
              index
            ],

          transparent:
            true,

          opacity:
            opacities[
              index
            ],

          blending:
            THREE.AdditiveBlending,

          depthTest:
            false,

          depthWrite:
            false,

          toneMapped:
            false,
        });

      const line =
        new THREE.Line(
          geometry,
          material,
        );

      line.frustumCulled =
        false;

      line.renderOrder =
        1000;

      this.weldScene.add(
        line,
      );

      geometries.push(
        geometry,
      );

      materials.push(
        material,
      );

      lines.push(
        line,
      );
    }

    const maxLife =
      0.2 +
      Math.random() *
        0.075;

    this.bolts.push({
      geometries,
      lines,
      materials,

      life:
        maxLife,

      maxLife,
    });
  }

  private triggerBolt(
    lineIndex:
      number,

    start:
      ScreenPoint,

    camera:
      THREE.PerspectiveCamera,
  ) {
    const targets =
      [0, 1, 2].filter(
        (
          index,
        ) =>
          index !==
          lineIndex,
      );

    if (
      Math.random() >
      0.5
    ) {
      targets.reverse();
    }

    const count =
      Math.random() >
      0.5
        ? 1
        : 2;

    for (
      const targetIndex of
      targets.slice(
        0,
        count,
      )
    ) {
      const target =
        this.closestPointOnSamples(
          this.samples[
            targetIndex
          ],
          start,
        );

      this.createBolt(
        start,
        target,
        camera,
      );
    }
  }

  private updateBolts(
    delta:
      number,
  ) {
    const baseOpacities = [
      0.19,
      0.38,
      0.7,
      1,
      0.7,
      0.38,
      0.19,
    ];

    let writeIndex =
      0;

    for (
      let index = 0;
      index <
      this.bolts.length;
      index += 1
    ) {
      const bolt =
        this.bolts[
          index
        ];

      bolt.life -=
        delta;

      if (
        bolt.life <=
        0
      ) {
        for (
          const line of
          bolt.lines
        ) {
          this.weldScene.remove(
            line,
          );
        }

        for (
          const geometry of
          bolt.geometries
        ) {
          geometry.dispose();
        }

        for (
          const material of
          bolt.materials
        ) {
          material.dispose();
        }

        continue;
      }

      const alpha =
        clamp01(
          bolt.life /
            bolt.maxLife,
        );

      for (
        let materialIndex = 0;
        materialIndex <
        bolt.materials.length;
        materialIndex += 1
      ) {
        bolt.materials[
          materialIndex
        ].opacity =
          alpha *
          baseOpacities[
            materialIndex
          ];
      }

      this.bolts[
        writeIndex
      ] =
        bolt;

      writeIndex +=
        1;
    }

    this.bolts.length =
      writeIndex;
  }

  update(
    _time:
      number,

    delta:
      number,

    pointerX:
      number,

    pointerY:
      number,

    scrollProgress:
      number,

    camera:
      THREE.PerspectiveCamera,
  ): WeldUpdateResult {
    this.elapsed +=
      delta;

    this.updateLineProgress();

    if (
      Math.abs(
        scrollProgress -
          this.lastScrollProgress,
      ) >
      0.001
    ) {
      this.lastScrollProgress =
        scrollProgress;

      this.canvasDirty =
        true;
    }

    this.weldCooldown =
      Math.max(
        0,
        this.weldCooldown -
          delta,
      );

    const ready =
      this.lineProgress.every(
        (
          progress,
        ) =>
          progress >=
          0.995,
      );

    const pointerActive =
      pointerX >
        -9000 &&
      pointerY >
        -9000;

    let burstStarted =
      false;

    if (
      ready &&
      pointerActive &&
      scrollProgress <
        0.08
    ) {
      const hit =
        this.hitTest({
          x:
            pointerX,

          y:
            pointerY,
        });

      if (hit) {
        if (
          this.sparkWasAway
        ) {
          this.sparkBurstLeft =
            5 +
            Math.floor(
              Math.random() *
                2,
            );

          this.sparkWasAway =
            false;

          burstStarted =
            true;
        }

        if (
          this.weldCooldown <=
            0 &&
          this.sparkBurstLeft >
            0
        ) {
          this.triggerBolt(
            hit.lineIndex,
            hit.point,
            camera,
          );

          this.sparkBurstLeft -=
            1;

          this.weldCooldown =
            0.04 +
            Math.random() *
              0.06;
        }
      } else {
        this.sparkWasAway =
          true;
      }
    } else {
      this.sparkWasAway =
        true;
    }

    if (
      this.bolts.length >
      0
    ) {
      this.updateBolts(
        delta,
      );
    }

    if (
      this.canvasDirty
    ) {
      this.drawBaseLines(
        scrollProgress,
      );
    }

    return {
      burstStarted,
    };
  }

  renderBase(
    renderer:
      THREE.WebGLRenderer,
  ) {
    renderer.render(
      this.baseScene,
      this.baseCamera,
    );
  }

  renderSparks(
    renderer:
      THREE.WebGLRenderer,

    camera:
      THREE.PerspectiveCamera,
  ) {
    if (
      this.bolts.length ===
      0
    ) {
      return;
    }

    renderer.clearDepth();

    renderer.render(
      this.weldScene,
      camera,
    );
  }

  destroy() {
    for (
      const bolt of
      this.bolts
    ) {
      for (
        const geometry of
        bolt.geometries
      ) {
        geometry.dispose();
      }

      for (
        const material of
        bolt.materials
      ) {
        material.dispose();
      }
    }

    this.bolts.length =
      0;

    this.baseGeometry.dispose();

    this.baseMaterial.dispose();

    this.texture.dispose();

    this.baseScene.clear();

    this.weldScene.clear();
  }
}