'use client';

import { useEffect, useRef } from 'react';

export default function LiquidBackground() {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let p5Instance: any;

        // Dynamically import p5 only on client side
        import('p5').then((p5Module) => {
            const p5 = p5Module.default;

            const sketch = (p: any) => {
                let particles: any[] = [];

                p.setup = () => {
                    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                    canvas.parent(canvasRef.current!);

                    // Create particles
                    for (let i = 0; i < 50; i++) {
                        particles.push({
                            x: p.random(p.width),
                            y: p.random(p.height),
                            vx: p.random(-0.5, 0.5),
                            vy: p.random(-0.5, 0.5),
                            size: p.random(2, 6),
                            alpha: p.random(0.1, 0.3)
                        });
                    }
                };

                p.draw = () => {
                    p.clear();

                    // Update and draw particles
                    for (let particle of particles) {
                        particle.x += particle.vx;
                        particle.y += particle.vy;

                        // Wrap around edges
                        if (particle.x < 0) particle.x = p.width;
                        if (particle.x > p.width) particle.x = 0;
                        if (particle.y < 0) particle.y = p.height;
                        if (particle.y > p.height) particle.y = 0;

                        // Draw particle
                        p.fill(255, 255, 255, particle.alpha * 255);
                        p.noStroke();
                        p.ellipse(particle.x, particle.y, particle.size);
                    }

                    // Draw connections
                    for (let i = 0; i < particles.length; i++) {
                        for (let j = i + 1; j < particles.length; j++) {
                            let d = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                            if (d < 100) {
                                p.stroke(255, 255, 255, (1 - d / 100) * 50);
                                p.strokeWeight(0.5);
                                p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                            }
                        }
                    }
                };

                p.windowResized = () => {
                    p.resizeCanvas(p.windowWidth, p.windowHeight);
                };
            };

            p5Instance = new p5(sketch);
        });

        return () => {
            if (p5Instance) {
                p5Instance.remove();
            }
        };
    }, []);

    return <div ref={canvasRef} className="liquid-bg" />;
}
