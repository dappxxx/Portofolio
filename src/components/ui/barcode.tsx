import { hashString, seededRandom } from "@/lib/random";

interface Bar {
  x: number;
  width: number;
}

/** Bar layout for a value: same input, same barcode. */
function barcodeBars(value: string, count: number) {
  const random = seededRandom(hashString(value));
  const bars: Bar[] = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const width = 1 + Math.floor(random() * 3);
    bars.push({ x, width });
    x += width + 1 + Math.floor(random() * 2);
  }
  return { bars, width: x };
}

/** Decorative barcode, deterministic for a given value. */
export function Barcode({ value, bars = 38, className }: { value: string; bars?: number; className?: string }) {
  const layout = barcodeBars(value, bars);
  return (
    <svg viewBox={`0 0 ${layout.width} 20`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {layout.bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={20} fill="currentColor" />
      ))}
    </svg>
  );
}
