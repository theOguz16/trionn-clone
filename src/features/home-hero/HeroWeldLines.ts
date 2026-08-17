import * as THREE from "three";

type Point = {
  x: number;
  y: number;
};

type Bolt = {
  points: Point[];
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
  a: Point,
  b: Point,
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

function nearestPointOnSegment(
  point: Point,
  start: Point,
  end: Point,
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
    lengthSquared ===
    0
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
  private readonly canvas:
    HTMLCanvasElement;

  private readonly context:
    CanvasRenderingContext2D;

  private readonly texture:
    THREE.CanvasTexture;

  private readonly material:
    THREE.MeshBasicMaterial;

  private readonly geometry:
    THREE.PlaneGeometry;

  private readonly mesh:
    THREE.Mesh;

  private readonly scene =
    new THREE.Scene();

  private readonly camera =
    new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      10,
    );

  private paths:
    Point[][] = [];

  private readonly lineProgress =
    [
      0,
      0,
      0,
    ];

  private bolts:
    Bolt[] = [];

  private elapsed =
    0;

  private cssWidth =
    1;

  private cssHeight =
    1;

  private pixelRatio =
    1;

  private sparkWasAway =
    true;

  private sparkBurstLeft =
    0;

  private weldCooldown =
    0;

  constructor() {
    this.canvas =
      document.createElement(
        "canvas",
      );

    const context =
      this.canvas.getContext(
        "2d",
      );

    if (!context) {
      throw new Error(
        "Could not create Hero weld canvas context.",
      );
    }

    this.context =
      context;

    this.texture =
      new THREE.CanvasTexture(
        this.canvas,
      );

    this.texture
      .colorSpace =
      THREE.SRGBColorSpace;

    this.texture
      .generateMipmaps =
      false;

    this.texture
      .minFilter =
      THREE.LinearFilter;

    this.texture
      .magFilter =
      THREE.LinearFilter;

    this.material =
      new THREE.MeshBasicMaterial(
        {
          map:
            this.texture,

          transparent:
            true,

          depthWrite:
            false,

          depthTest:
            false,

          toneMapped:
            false,
        },
      );

    this.geometry =
      new THREE.PlaneGeometry(
        2,
        2,
      );

    this.mesh =
      new THREE.Mesh(
        this.geometry,
        this.material,
      );

    this.mesh
      .frustumCulled =
      false;

    this.camera
      .position.z =
      1;

    this.scene.add(
      this.mesh,
    );
  }

  resize(
    width: number,
    height: number,
    pixelRatio: number,
  ) {
    this.cssWidth =
      Math.max(
        width,
        1,
      );

    this.cssHeight =
      Math.max(
        height,
        1,
      );

    this.pixelRatio =
      Math.min(
        pixelRatio,
        2,
      );

    this.canvas.width =
      Math.round(
        this.cssWidth *
          this.pixelRatio,
      );

    this.canvas.height =
      Math.round(
        this.cssHeight *
          this.pixelRatio,
      );

    this.context
      .setTransform(
        this.pixelRatio,
        0,
        0,
        this.pixelRatio,
        0,
        0,
      );

    this.buildPaths();

    this.texture
      .needsUpdate =
      true;
  }

  private buildPaths() {
    const width =
      this.cssWidth;

    const height =
      this.cssHeight;

    /*
     * Test modelimizin ekran
     * pozisyonuna göre 3 guide line.
     *
     * Orijinal private koordinatlar
     * yayınlanmadığı için yalnızca bu
     * path koordinatları asset'e göre
     * tune edilecek.
     */
    const center = {
      x:
        width *
        0.59,

      y:
        height *
        0.53,
    };

    this.paths = [
      [
        center,

        {
          x:
            width *
            0.47,

          y:
            height *
            0.58,
        },

        {
          x:
            width *
            0.25,

          y:
            height *
            0.67,
        },

        {
          x:
            -width *
            0.05,

          y:
            height *
            0.79,
        },
      ],

      [
        center,

        {
          x:
            width *
            0.69,

          y:
            height *
            0.47,
        },

        {
          x:
            width *
            0.84,

          y:
            height *
            0.39,
        },

        {
          x:
            width *
            1.05,

          y:
            height *
            0.29,
        },
      ],

      [
        center,

        {
          x:
            width *
            0.53,

          y:
            height *
            0.66,
        },

        {
          x:
            width *
            0.42,

          y:
            height *
            0.84,
        },

        {
          x:
            width *
            0.31,

          y:
            height *
            1.07,
        },
      ],
    ];
  }

  private updateLineProgress() {
    for (
      let index = 0;
      index <
      this.lineProgress
        .length;
      index += 1
    ) {
      const delay =
        0.7 +
        index *
          0.12;

      const duration =
        0.72;

      this.lineProgress[
        index
      ] =
        clamp01(
          (
            this.elapsed -
            delay
          ) /
            duration,
        );
    }
  }

  private tracePartialPath(
    path: Point[],
    progress: number,
  ) {
    const context =
      this.context;

    if (
      path.length <
      2
    ) {
      return;
    }

    const lengths:
      number[] = [];

    let totalLength =
      0;

    for (
      let index = 0;
      index <
      path.length -
        1;
      index += 1
    ) {
      const start =
        path[index];

      const end =
        path[
          index +
            1
        ];

      const dx =
        end.x -
        start.x;

      const dy =
        end.y -
        start.y;

      const length =
        Math.sqrt(
          dx * dx +
            dy * dy,
        );

      lengths.push(
        length,
      );

      totalLength +=
        length;
    }

    let remaining =
      totalLength *
      clamp01(
        progress,
      );

    context.moveTo(
      path[0].x,
      path[0].y,
    );

    for (
      let index = 0;
      index <
      lengths.length;
      index += 1
    ) {
      const start =
        path[index];

      const end =
        path[
          index +
            1
        ];

      const segmentLength =
        lengths[index];

      if (
        remaining >=
        segmentLength
      ) {
        context.lineTo(
          end.x,
          end.y,
        );

        remaining -=
          segmentLength;

        continue;
      }

      if (
        remaining >
        0
      ) {
        const t =
          remaining /
          segmentLength;

        context.lineTo(
          start.x +
            (
              end.x -
              start.x
            ) *
              t,

          start.y +
            (
              end.y -
              start.y
            ) *
              t,
        );
      }

      break;
    }
  }

  private closestPointOnPath(
    path: Point[],
    pointer: Point,
  ) {
    let best:
      Point | null =
      null;

    let bestDistance =
      Infinity;

    for (
      let index = 0;
      index <
      path.length -
        1;
      index += 1
    ) {
      const nearest =
        nearestPointOnSegment(
          pointer,
          path[index],
          path[
            index +
              1
          ],
        );

      const distance =
        distanceSquared(
          nearest,
          pointer,
        );

      if (
        distance <
        bestDistance
      ) {
        bestDistance =
          distance;

        best =
          nearest;
      }
    }

    return best;
  }

  private hitTest(
    pointer: Point,
  ) {
    const tolerance =
      14;

    const toleranceSquared =
      tolerance *
      tolerance;

    for (
      let lineIndex = 0;
      lineIndex <
      this.paths.length;
      lineIndex += 1
    ) {
      const path =
        this.paths[
          lineIndex
        ];

      const nearest =
        this.closestPointOnPath(
          path,
          pointer,
        );

      if (!nearest) {
        continue;
      }

      if (
        distanceSquared(
          nearest,
          pointer,
        ) <=
        toleranceSquared
      ) {
        return {
          lineIndex,
          point:
            nearest,
        };
      }
    }

    return null;
  }

  private createBolt(
    start: Point,
    end: Point,
  ) {
    const segmentCount =
      9;

    const points:
      Point[] = [];

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
        13 *
        envelope;

      points.push(
        {
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
        },
      );
    }

    const maxLife =
      0.1 +
      Math.random() *
        0.055;

    this.bolts.push(
      {
        points,
        life:
          maxLife,
        maxLife,
      },
    );
  }

  private triggerBolt(
    hitLineIndex: number,
    start: Point,
  ) {
    const otherIndexes =
      [
        0,
        1,
        2,
      ].filter(
        (
          index,
        ) =>
          index !==
          hitLineIndex,
      );

    otherIndexes.sort(
      () =>
        Math.random() -
        0.5,
    );

    const count =
      Math.random() >
      0.5
        ? 1
        : 2;

    for (
      const targetIndex of
      otherIndexes.slice(
        0,
        count,
      )
    ) {
      const target =
        this.closestPointOnPath(
          this.paths[
            targetIndex
          ],
          start,
        );

      if (!target) {
        continue;
      }

      this.createBolt(
        start,
        target,
      );
    }
  }

  private drawGuideLines(
    time: number,
    scrollProgress: number,
  ) {
    const context =
      this.context;

    const undraw =
      clamp01(
        (
          scrollProgress -
          0.02
        ) /
          0.18,
      );

    const alpha =
      (
        0.1 +
        Math.sin(
          time *
            1.4,
        ) *
          0.012
      ) *
      (
        1 -
        undraw
      );

    context
      .save();

    context
      .lineWidth =
      0.8;

    context
      .strokeStyle =
      `rgba(255,255,255,${Math.max(
        0,
        alpha,
      )})`;

    for (
      let index = 0;
      index <
      this.paths.length;
      index += 1
    ) {
      const progress =
        this.lineProgress[
          index
        ] *
        (
          1 -
          undraw
        );

      if (
        progress <=
        0
      ) {
        continue;
      }

      context
        .beginPath();

      this.tracePartialPath(
        this.paths[
          index
        ],
        progress,
      );

      context.stroke();
    }

    context.restore();
  }

  private drawBolts() {
    const context =
      this.context;

    context.save();

    context.globalCompositeOperation =
      "lighter";

    for (
      const bolt of
      this.bolts
    ) {
      const alpha =
        clamp01(
          bolt.life /
            bolt.maxLife,
        );

      if (
        bolt.points
          .length <
        2
      ) {
        continue;
      }

      context
        .beginPath();

      context.moveTo(
        bolt
          .points[0]
          .x,

        bolt
          .points[0]
          .y,
      );

      for (
        let index = 1;
        index <
        bolt.points
          .length;
        index += 1
      ) {
        context.lineTo(
          bolt
            .points[
              index
            ]
            .x,

          bolt
            .points[
              index
            ]
            .y,
        );
      }

      context
        .lineWidth =
        6;

      context
        .strokeStyle =
        `rgba(255,72,0,${
          alpha *
          0.24
        })`;

      context
        .shadowColor =
        "rgba(255,72,0,0.8)";

      context
        .shadowBlur =
        14;

      context.stroke();

      context
        .lineWidth =
        1;

      context
        .strokeStyle =
        `rgba(255,235,210,${
          alpha *
          0.95
        })`;

      context
        .shadowBlur =
        4;

      context.stroke();
    }

    context.restore();
  }

  update(
    time: number,
    delta: number,
    pointerX: number,
    pointerY: number,
    scrollProgress: number,
  ): WeldUpdateResult {
    this.elapsed +=
      delta;

    this.updateLineProgress();

    this.weldCooldown =
      Math.max(
        0,
        this.weldCooldown -
          delta,
      );

    const linesReady =
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

    const enabled =
      linesReady &&
      pointerActive &&
      scrollProgress <
        0.08;

    let burstStarted =
      false;

    if (enabled) {
      const hit =
        this.hitTest(
          {
            x:
              pointerX,

            y:
              pointerY,
          },
        );

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

    for (
      const bolt of
      this.bolts
    ) {
      bolt.life -=
        delta;
    }

    this.bolts =
      this.bolts.filter(
        (
          bolt,
        ) =>
          bolt.life >
          0,
      );

    this.context
      .clearRect(
        0,
        0,
        this.cssWidth,
        this.cssHeight,
      );

    this.drawGuideLines(
      time,
      scrollProgress,
    );

    this.drawBolts();

    this.texture
      .needsUpdate =
      true;

    return {
      burstStarted,
    };
  }

  render(
    renderer:
      THREE.WebGLRenderer,
  ) {
    renderer.render(
      this.scene,
      this.camera,
    );
  }

  destroy() {
    this.geometry.dispose();

    this.material.dispose();

    this.texture.dispose();

    this.bolts = [];

    this.scene.clear();
  }
}