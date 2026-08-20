import * as THREE from "three";

type ScreenPoint = {
  x: number;
  y: number;
};

type WeldBolt = {
  geometries: THREE.BufferGeometry[];
  lines: THREE.Line[];
  materials: THREE.LineBasicMaterial[];
  life: number;
  maxLife: number;
};

type WeldUpdateResult = {
  burstStarted: boolean;
};

type GuideDefinition = {
  rx: number;
  ry: number;
  rotation: number;
  anchorAngle: number;
  halfSpan: number;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function distanceSquared(a: ScreenPoint, b: ScreenPoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function nearestPointOnSegment(
  point: ScreenPoint,
  start: ScreenPoint,
  end: ScreenPoint,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 0.0001) {
    return { ...start };
  }

  const t = clamp01(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) /
      lengthSquared,
  );

  return {
    x: start.x + dx * t,
    y: start.y + dy * t,
  };
}

export class HeroWeldLines {
  private readonly canvas = document.createElement("canvas");
  private readonly context: CanvasRenderingContext2D;
  private readonly texture: THREE.CanvasTexture;
  private readonly baseGeometry = new THREE.PlaneGeometry(2, 2);
  private readonly baseMaterial: THREE.MeshBasicMaterial;
  private readonly baseScene = new THREE.Scene();
  private readonly baseCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    10,
  );
  private readonly weldScene = new THREE.Scene();

  private readonly anchors: ScreenPoint[] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  private readonly samples: ScreenPoint[][] = Array.from(
    { length: 3 },
    () => Array.from({ length: 161 }, () => ({ x: 0, y: 0 })),
  );

  private readonly lineProgress = [0, 0, 0];
  private readonly lastLineProgress = [-1, -1, -1];

  private bolts: WeldBolt[] = [];
  private elapsed = 0;
  private width = 1;
  private height = 1;
  private hasExternalAnchors = false;
  private canvasDirty = true;
  private lastScrollProgress = -1;
  private sparkWasAway = true;
  private sparkBurstLeft = 0;
  private weldCooldown = 0;

  constructor() {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create hero guide-line canvas.");
    }

    this.context = context;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.baseMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });

    const baseMesh = new THREE.Mesh(this.baseGeometry, this.baseMaterial);
    baseMesh.frustumCulled = false;
    this.baseScene.add(baseMesh);
    this.baseCamera.position.z = 1;
  }

  resize(width: number, height: number) {
    this.width = Math.max(width, 1);
    this.height = Math.max(height, 1);
    this.canvas.width = Math.max(1, Math.round(this.width));
    this.canvas.height = Math.max(1, Math.round(this.height));
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.buildPaths();
    this.canvasDirty = true;
  }

  setAnchors(anchors: ScreenPoint[]) {
    if (anchors.length < 3) {
      return;
    }

    let changed = !this.hasExternalAnchors;

    for (let index = 0; index < 3; index += 1) {
      if (
        !this.hasExternalAnchors ||
        distanceSquared(this.anchors[index], anchors[index]) > 0.18
      ) {
        this.anchors[index].x = anchors[index].x;
        this.anchors[index].y = anchors[index].y;
        changed = true;
      }
    }

    this.hasExternalAnchors = true;

    if (changed) {
      this.buildPaths();
      this.canvasDirty = true;
    }
  }

  private buildPaths() {
    const w = this.width;
    const h = this.height;
    const fallback = { x: w * 0.57, y: h * 0.55 };

    /*
     * Each guide is one long elliptical arc.
     *
     * Crucially, the midpoint of each arc is pinned to the projected
     * model anchor. The arc then continues in both directions beyond
     * the viewport. Because HeroScene renders this base layer before
     * the model, the model naturally occludes the middle of each line:
     *
     * line -> behind model -> line
     *
     * This preserves one continuous geometric path while giving the
     * correct depth read.
     */
    const definitions: GuideDefinition[] = [
      {
        rx: w * 1.15,
        ry: h * 0.5,
        rotation: -0.23,
        anchorAngle: 1.55,
        halfSpan: 1.68,
      },
      {
        rx: w * 1.05,
        ry: h * 0.64,
        rotation: -0.42,
        anchorAngle: 1.65,
        halfSpan: 1.72,
      },
      {
        rx: w * 1.22,
        ry: h * 0.76,
        rotation: 0.25,
        anchorAngle: 1.45,
        halfSpan: 1.68,
      },
    ];

    for (let pathIndex = 0; pathIndex < 3; pathIndex += 1) {
      const definition = definitions[pathIndex];
      const samples = this.samples[pathIndex];
      const anchor = this.hasExternalAnchors
        ? this.anchors[pathIndex]
        : fallback;

      const cosR = Math.cos(definition.rotation);
      const sinR = Math.sin(definition.rotation);

      const anchorLocalX =
        Math.cos(definition.anchorAngle) * definition.rx;
      const anchorLocalY =
        Math.sin(definition.anchorAngle) * definition.ry;

      const centerX =
        anchor.x -
        (anchorLocalX * cosR - anchorLocalY * sinR);
      const centerY =
        anchor.y -
        (anchorLocalX * sinR + anchorLocalY * cosR);

      for (let index = 0; index < samples.length; index += 1) {
        const normalized = index / (samples.length - 1);
        const centered = normalized * 2 - 1;
        const angle =
          definition.anchorAngle + centered * definition.halfSpan;

        const localX = Math.cos(angle) * definition.rx;
        const localY = Math.sin(angle) * definition.ry;

        samples[index].x =
          centerX + localX * cosR - localY * sinR;
        samples[index].y =
          centerY + localX * sinR + localY * cosR;
      }
    }
  }

  private updateLineProgress() {
    for (let index = 0; index < 3; index += 1) {
      const delay = 0.72 + index * 0.12;
      const progress = clamp01((this.elapsed - delay) / 0.82);
      this.lineProgress[index] = progress;

      if (Math.abs(progress - this.lastLineProgress[index]) > 0.001) {
        this.lastLineProgress[index] = progress;
        this.canvasDirty = true;
      }
    }
  }

  private drawSampledPath(
    samples: ScreenPoint[],
    progress: number,
  ) {
    const normalized = clamp01(progress);
    const middleIndex = Math.floor((samples.length - 1) / 2);
    const leftCount = Math.floor(middleIndex * normalized);
    const rightCount = Math.floor(
      (samples.length - 1 - middleIndex) * normalized,
    );
    const startIndex = Math.max(0, middleIndex - leftCount);
    const endIndex = Math.min(
      samples.length - 1,
      middleIndex + rightCount,
    );

    if (endIndex <= startIndex) {
      return;
    }

    this.context.moveTo(
      samples[startIndex].x,
      samples[startIndex].y,
    );

    for (let index = startIndex + 1; index <= endIndex; index += 1) {
      this.context.lineTo(samples[index].x, samples[index].y);
    }
  }

  private drawPathLayer(
    lineWidth: number,
    alpha: number,
    scrollProgress: number,
  ) {
    const visible = 1 - clamp01((scrollProgress - 0.02) / 0.18);

    this.context.save();
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.lineWidth = lineWidth;
    this.context.strokeStyle = `rgba(170,190,220,${alpha * visible})`;

    for (let index = 0; index < 3; index += 1) {
      const progress = this.lineProgress[index] * visible;

      if (progress <= 0) {
        continue;
      }

      this.context.beginPath();
      this.drawSampledPath(this.samples[index], progress);
      this.context.stroke();
    }

    this.context.restore();
  }

  private drawBaseLines(scrollProgress: number) {
    this.context.clearRect(0, 0, this.width, this.height);

    /*
     * Restrained base guides. The model should dominate; these should
     * only become assertive when the user creates weld sparks.
     */
    this.drawPathLayer(2.2, 0.055, scrollProgress);
    this.drawPathLayer(0.95, 0.13, scrollProgress);
    this.drawPathLayer(0.5, 0.25, scrollProgress);

    this.texture.needsUpdate = true;
    this.canvasDirty = false;
  }

  private closestPointOnSamples(
    samples: ScreenPoint[],
    point: ScreenPoint,
  ) {
    let best = samples[0];
    let bestDistance = Infinity;

    for (let index = 0; index < samples.length - 1; index += 1) {
      const candidate = nearestPointOnSegment(
        point,
        samples[index],
        samples[index + 1],
      );
      const distance = distanceSquared(point, candidate);

      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }

    return best;
  }

  private hitTest(pointer: ScreenPoint) {
    const tolerance = 14;
    const toleranceSquared = tolerance * tolerance;

    for (let index = 0; index < 3; index += 1) {
      const nearest = this.closestPointOnSamples(
        this.samples[index],
        pointer,
      );

      if (distanceSquared(nearest, pointer) <= toleranceSquared) {
        return { lineIndex: index, point: nearest };
      }
    }

    return null;
  }

  private screenToWorld(
    point: ScreenPoint,
    camera: THREE.PerspectiveCamera,
  ) {
    const ndc = new THREE.Vector3(
      (point.x / this.width) * 2 - 1,
      -((point.y / this.height) * 2 - 1),
      0.5,
    );

    ndc.unproject(camera);
    const direction = ndc.sub(camera.position).normalize();
    const targetZ = 0.18;

    if (Math.abs(direction.z) < 0.0001) {
      return new THREE.Vector3(0, 0, targetZ);
    }

    const distance = (targetZ - camera.position.z) / direction.z;
    return camera.position.clone().add(direction.multiplyScalar(distance));
  }

  private createBolt(
    start: ScreenPoint,
    end: ScreenPoint,
    camera: THREE.PerspectiveCamera,
  ) {
    const segmentCount = 13;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const normalX = -dy / length;
    const normalY = dx / length;
    const screenPoints: ScreenPoint[] = [];

    for (let index = 0; index <= segmentCount; index += 1) {
      const t = index / segmentCount;
      const envelope = Math.sin(t * Math.PI);
      const jitter = (Math.random() * 2 - 1) * 10 * envelope;

      screenPoints.push({
        x: start.x + dx * t + normalX * jitter,
        y: start.y + dy * t + normalY * jitter,
      });
    }

    const offsets = [-2.8, -1.7, -0.8, 0, 0.8, 1.7, 2.8];
    const colors = [
      0x031f61,
      0x0756e8,
      0x27b1ff,
      0xfaffff,
      0x57dcff,
      0x0965f4,
      0x03266d,
    ];
    const opacities = [0.16, 0.3, 0.62, 0.95, 0.62, 0.3, 0.16];
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.LineBasicMaterial[] = [];
    const lines: THREE.Line[] = [];

    for (let index = 0; index < offsets.length; index += 1) {
      const offset = offsets[index];
      const worldPoints = screenPoints.map((point) =>
        this.screenToWorld(
          {
            x: point.x + normalX * offset,
            y: point.y + normalY * offset,
          },
          camera,
        ),
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(worldPoints);
      const material = new THREE.LineBasicMaterial({
        color: colors[index],
        transparent: true,
        opacity: opacities[index],
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      line.renderOrder = 1000;
      this.weldScene.add(line);
      geometries.push(geometry);
      materials.push(material);
      lines.push(line);
    }

    const maxLife = 0.2 + Math.random() * 0.075;
    this.bolts.push({
      geometries,
      lines,
      materials,
      life: maxLife,
      maxLife,
    });
  }

  private triggerBolt(
    lineIndex: number,
    start: ScreenPoint,
    camera: THREE.PerspectiveCamera,
  ) {
    const targets = [0, 1, 2].filter((index) => index !== lineIndex);

    if (Math.random() > 0.5) {
      targets.reverse();
    }

    const count = Math.random() > 0.5 ? 1 : 2;

    for (const targetIndex of targets.slice(0, count)) {
      const target = this.closestPointOnSamples(
        this.samples[targetIndex],
        start,
      );
      this.createBolt(start, target, camera);
    }
  }

  private updateBolts(delta: number) {
    const baseOpacities = [0.16, 0.3, 0.62, 0.95, 0.62, 0.3, 0.16];
    let writeIndex = 0;

    for (let index = 0; index < this.bolts.length; index += 1) {
      const bolt = this.bolts[index];
      bolt.life -= delta;

      if (bolt.life <= 0) {
        for (const line of bolt.lines) {
          this.weldScene.remove(line);
        }
        for (const geometry of bolt.geometries) {
          geometry.dispose();
        }
        for (const material of bolt.materials) {
          material.dispose();
        }
        continue;
      }

      const alpha = clamp01(bolt.life / bolt.maxLife);

      for (
        let materialIndex = 0;
        materialIndex < bolt.materials.length;
        materialIndex += 1
      ) {
        bolt.materials[materialIndex].opacity =
          alpha * baseOpacities[materialIndex];
      }

      this.bolts[writeIndex] = bolt;
      writeIndex += 1;
    }

    this.bolts.length = writeIndex;
  }

  update(
    _time: number,
    delta: number,
    pointerX: number,
    pointerY: number,
    scrollProgress: number,
    camera: THREE.PerspectiveCamera,
  ): WeldUpdateResult {
    this.elapsed += delta;
    this.updateLineProgress();

    if (Math.abs(scrollProgress - this.lastScrollProgress) > 0.001) {
      this.lastScrollProgress = scrollProgress;
      this.canvasDirty = true;
    }

    this.weldCooldown = Math.max(0, this.weldCooldown - delta);

    const ready = this.lineProgress.every((progress) => progress >= 0.995);
    const pointerActive = pointerX > -9000 && pointerY > -9000;
    let burstStarted = false;

    if (ready && pointerActive && scrollProgress < 0.08) {
      const hit = this.hitTest({ x: pointerX, y: pointerY });

      if (hit) {
        if (this.sparkWasAway) {
          this.sparkBurstLeft = 5 + Math.floor(Math.random() * 2);
          this.sparkWasAway = false;
          burstStarted = true;
        }

        if (this.weldCooldown <= 0 && this.sparkBurstLeft > 0) {
          this.triggerBolt(hit.lineIndex, hit.point, camera);
          this.sparkBurstLeft -= 1;
          this.weldCooldown = 0.04 + Math.random() * 0.06;
        }
      } else {
        this.sparkWasAway = true;
      }
    } else {
      this.sparkWasAway = true;
    }

    if (this.bolts.length > 0) {
      this.updateBolts(delta);
    }

    if (this.canvasDirty) {
      this.drawBaseLines(scrollProgress);
    }

    return { burstStarted };
  }

  renderBase(renderer: THREE.WebGLRenderer) {
    renderer.render(this.baseScene, this.baseCamera);
  }

  renderSparks(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
  ) {
    if (this.bolts.length === 0) {
      return;
    }

    renderer.clearDepth();
    renderer.render(this.weldScene, camera);
  }

  destroy() {
    for (const bolt of this.bolts) {
      for (const geometry of bolt.geometries) {
        geometry.dispose();
      }
      for (const material of bolt.materials) {
        material.dispose();
      }
    }

    this.bolts.length = 0;
    this.baseGeometry.dispose();
    this.baseMaterial.dispose();
    this.texture.dispose();
    this.baseScene.clear();
    this.weldScene.clear();
  }
}
