"use client";

import React, { useEffect } from 'react';

interface ModelViewerProps {
  src: string;
}

const ModelViewer = ({ src }: ModelViewerProps) => {
  useEffect(() => {
    // Import the custom element side-effect only on the client
    import('@google/model-viewer').catch(err => {
        console.error("Failed to load model-viewer", err);
    });
  }, []);

  // Use a type assertion for the tag name to bypass JSX intrinsic element checks
  const ModelViewerElement = 'model-viewer' as any;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0A0A0A]">
      <ModelViewerElement
        src={src}
        alt="Proyecto 3D interactivo"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1.5"
        shadow-softness="1"
        exposure="1"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        class="w-full h-full"
      >
        {/* AR Button styling via CSS parts or custom placement if needed */}
        <div slot="ar-button" id="ar-button" className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-widest uppercase active:scale-95 transition-all">
          ✨ Ver en mi espacio (AR)
        </div>

        <div className="absolute top-10 left-10 pointer-events-none">
            <h1 className="text-white font-black text-2xl tracking-tighter uppercase mb-1">Visualizador Azur 3D</h1>
            <div className="h-0.5 w-12 bg-red-600" />
        </div>
        
        {/* Loading progress placeholder if needed */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-neg">
             <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-red-600 animate-spin opacity-20" />
        </div>
      </ModelViewerElement>
    </div>
  );
};

export default ModelViewer;
