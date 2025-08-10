{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    flowbite-svelte = {
      url = "github:themesberg/flowbite-svelte/v1.11.4";
      flake = false;
    };
  };
  outputs = { self, nixpkgs, utils, flowbite-svelte }: utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};
    in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
          ];
          shellHook = ''
            npm install

            mkdir -p .private/docs
            rm -rf .private/docs/flowbite-svelte
            cp -rL --no-preserve=all ${flowbite-svelte}/static/llm .private/docs/flowbite-svelte
          '';
        };
      }
  );
}
