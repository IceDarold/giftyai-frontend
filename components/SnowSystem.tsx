
import React, { createContext, useContext, useEffect, useRef } from 'react';

// --- Types & Context ---

interface SnowContextType {
  intensityRef: React.MutableRefObject<number>; 
}

const SnowContext = createContext<SnowContextType | null>(null);

export const useSnow = () => {
    const ctx = useContext(SnowContext);
    if (!ctx) throw new Error("useSnow must be used within SnowProvider");
    return ctx;
};

// --- Provider Component ---

export const SnowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intensityRef = useRef(0);
  const lastScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Shake Detection Logic (Maintained for potential ambient effects)
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      
      const totalAccel = Math.sqrt(x * x + y * y + z * z);

      if (totalAccel > 15) {
         intensityRef.current = 1.0; 
      }
    };

    window.addEventListener('devicemotion', handleMotion, true);
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;

      const instantVelocity = Math.min(delta / 50, 1);
      if (intensityRef.current < 0.5) {
          intensityRef.current = Math.max(intensityRef.current, instantVelocity * 0.5);
      }
    };

    const decayLoop = () => {
        if (intensityRef.current > 0.001) {
            intensityRef.current *= 0.9; 
        } else {
            intensityRef.current = 0;
        }
        rafRef.current = requestAnimationFrame(decayLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    decayLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <SnowContext.Provider value={{ intensityRef }}>
      {children}
    </SnowContext.Provider>
  );
};

// --- Helper Draw Function (Gift/Tech Particles) ---
const drawGiftParticle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number, color: string, shape: 'square' | 'circle' | 'cross') => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    if (shape === 'square') {
        // Gift box shape
        ctx.fillRect(-size/2, -size/2, size, size);
    } else if (shape === 'cross') {
        // Sparkle/Tech shape
        ctx.fillRect(-size/2, -size/6, size, size/3);
        ctx.fillRect(-size/6, -size/2, size/3, size);
    } else {
        // Bokeh circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// --- Ambient Confetti Component ---

class AmbientParticle {
    x: number;
    y: number;
    vy: number;
    size: number;
    oscillationSpeed: number;
    oscillationAmp: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
    shape: 'square' | 'circle' | 'cross';

    constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height; 
        this.reset(width, height, true);
    }

    reset(width: number, height: number, initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        this.size = Math.random() * 5 + 2; 
        this.opacity = Math.random() * 0.5 + 0.1;
        this.vy = Math.random() * 0.5 + 0.2; // Slower float
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.oscillationAmp = Math.random() * 0.5 + 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // Friendly & Bright Palette
        const colors = ['#FF6B6B', '#4FD1C5', '#FCD34D', '#8B5CF6', '#F472B6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        const shapes: ('square' | 'circle' | 'cross')[] = ['square', 'square', 'cross', 'circle'];
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    }

    update(width: number, height: number) {
        this.y += this.vy;
        this.x += Math.sin(this.y * this.oscillationSpeed) * this.oscillationAmp;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
            this.reset(width, height);
        }
        if (this.x > width + 20) this.x = -20;
        if (this.x < -20) this.x = width + 20;
    }

    draw(ctx: CanvasRenderingContext2D) {
        drawGiftParticle(ctx, this.x, this.y, this.size, this.opacity, this.rotation, this.color, this.shape);
    }
}

export const AmbientSnow: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<AmbientParticle[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            
            // Particles count - more dense for confetti feeling
            particles.current = Array.from({ length: 60 }).map(() => 
                new AmbientParticle(window.innerWidth, window.innerHeight)
            );
        };

        const render = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            particles.current.forEach(p => {
                p.update(width, height);
                p.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(render);
        };

        init();
        render();

        const handleResize = () => init();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ width: '100%', height: '100%' }}
        />
    );
};
