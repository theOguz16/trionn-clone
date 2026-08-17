export type RuntimeFrame = {
  time: number;
  delta: number;
  frame: number;
};

export interface RuntimeScene {
  readonly id: string;

  update(frame: RuntimeFrame): void;

  resize(): void;

  destroy(): void;
}