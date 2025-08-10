{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    svelte = {
      url = "github:sveltejs/svelte/svelte@5.38.0";
      flake = false;
    };
    sveltekit = {
      type = "github";
      owner = "sveltejs";
      repo = "kit";
      ref = "@sveltejs/kit@2.27.3";
      flake = false;
    };
    flowbite-svelte = {
      url = "github:themesberg/flowbite-svelte/v1.11.4";
      flake = false;
    };
  };
  outputs = { nixpkgs, utils, ... }@inputs: utils.lib.eachDefaultSystem (system:
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

            rm -rf .private/docs/svelte
            cp -rL --no-preserve=all ${inputs.svelte}/documentation/docs .private/docs/svelte

            rm -rf .private/docs/sveltekit
            cp -rL --no-preserve=all ${inputs.sveltekit}/documentation/docs .private/docs/sveltekit

            rm -rf .private/docs/flowbite-svelte
            cp -rL --no-preserve=all ${inputs.flowbite-svelte}/static/llm .private/docs/flowbite-svelte
          '';
        };
      }
  );
}
