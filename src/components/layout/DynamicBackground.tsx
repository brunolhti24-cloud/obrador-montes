import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  const [sparks, setSparks] = useState<{ id: number; left: string; delay: string; duration: string; size: string; opacity: number }[]>([]);

  useEffect(() => {
    const newSparks = Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${8 + Math.random() * 14}s`,
      size: `${2 + Math.random() * 5}px`,
      opacity: 0.3 + Math.random() * 0.6,
    }));
    setSparks(newSparks);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Rich base - Warm cream/white gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              160deg,
              hsl(40, 30%, 98%) 0%,
              hsl(40, 25%, 96%) 30%,
              hsl(40, 20%, 94%) 50%,
              hsl(40, 25%, 96%) 70%,
              hsl(40, 30%, 98%) 100%
            )
          `,
        }}
      />

      {/* Animated soft red/burgundy glow - top left */}
      <div
        className="absolute w-[120vw] h-[120vh] -top-[30%] -left-[30%] animate-smoke-slow"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(150,20,20,0.05) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Animated soft gold shimmer - right side */}
      <div
        className="absolute w-[120vw] h-[120vh] animate-smoke-slower"
        style={{
          background: 'radial-gradient(ellipse 50% 45% at 85% 60%, rgba(191,149,63,0.08) 0%, transparent 60%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Animated soft blush accent - bottom */}
      <div
        className="absolute w-[120vw] h-[120vh] animate-smoke-slow"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 40% 95%, rgba(183,28,28,0.04) 0%, transparent 55%)',
          filter: 'blur(80px)',
          animationDelay: '-10s',
        }}
      />

      {/* Light center glow */}
      <div
        className="absolute w-[100vw] h-[100vh] animate-smoke-slower"
        style={{
          background: 'radial-gradient(ellipse 40% 35% at 55% 50%, rgba(252,246,186,0.15) 0%, transparent 55%)',
          filter: 'blur(60px)',
          animationDelay: '-5s',
        }}
      />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* Floating Ember Sparks */}
      <div className="absolute inset-0">
        {sparks.map(spark => (
          <div
            key={spark.id}
            className="absolute bottom-[-20px] rounded-full animate-float-up"
            style={{
              left: spark.left,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
              opacity: spark.opacity,
              background: `radial-gradient(circle, #FCF6BA, #BF953F)`,
              boxShadow: `0 0 ${parseInt(spark.size) * 3}px rgba(191,149,63,0.5), 0 0 ${parseInt(spark.size) * 8}px rgba(191,149,63,0.2)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
