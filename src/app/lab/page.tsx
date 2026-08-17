import { AudioLearningDemo } from "@/features/audio-learning-demo/AudioLearningDemo";
import { GsapLearningDemo } from "@/features/gsap-learning-demo";
import { ThreeLearningDemo } from "@/features/three-learning-demo/ThreeLearningDemo";

export default function LabPage() {
  return (
    <main>
      <section className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-7xl font-bold">
          MOTION LAB
        </h1>
      </section>

      <GsapLearningDemo />

      <ThreeLearningDemo />

      <AudioLearningDemo />
    </main>
  );
}