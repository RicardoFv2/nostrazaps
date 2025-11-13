{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_24
    pkgs.nodePackages.npm
    pkgs.nodePackages.pnpm
  ];

  shellHook = ''
    echo "🚀 Entorno de desarrollo TurboZaps listo!"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo ""
    echo "Para instalar dependencias, ejecuta:"
    echo "  npm install --legacy-peer-deps"
    echo "  o"
    echo "  pnpm install"
  '';
}


