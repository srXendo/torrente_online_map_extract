const fs = require('fs')
function parseOBJ(path) {
  const data = fs.readFileSync(path, "utf8");
  const vertices = [];

  data.split("\n").forEach(line => {
    line = line.trim();
    if (line.startsWith("v ")) {
      const [, x, y, z] = line.split(/\s+/).map(Number);
      vertices.push({ x, z }); // usamos x,z para 2D
    }
  });

  return vertices;
}
function verticesToGrid(vertices, width, height) {
  const grid = Array.from({ length: height }, () =>
    Array(width).fill(0)
  );

  const xs = vertices.map(v => v.x);
  const zs = vertices.map(v => v.z);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  vertices.forEach(v => {
    const gx = Math.floor(
      ((v.x - minX) / (maxX - minX)) * (width - 1)
    );
    const gz = Math.floor(
      ((v.z - minZ) / (maxZ - minZ)) * (height - 1)
    );

    grid[gz][gx] = 1; // obstáculo
  });

  return grid;
}
const vertices = parseOBJ("./test.opt.obj");
const mapa = verticesToGrid(vertices, 3000, 3000);

console.log(JSON.stringify(mapa));