export function mm_to_points(mm: number) {
  return (mm / 25.4) * 72;
}

export function points_to_mm(p: number) {
  return (p / 72) * 25.4;
}
