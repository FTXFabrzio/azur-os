"use client";

import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
});

export default function ModelViewerDynamic({ src }: { src: string }) {
  return <ModelViewer src={src} />;
}
