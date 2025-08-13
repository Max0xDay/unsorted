import { bundle } from "https://deno.land/x/emit@0.31.0/mod.ts";

const url = new URL("./public/app.ts", import.meta.url);

const result = await bundle(url, {
  compilerOptions: {
    target: "ES2020",
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    sourceMap: false,
  },
});

const code = result.code.replace(/\.ts/g, '.js');

await Deno.writeTextFile("./public/app.js", code);

console.log("Build complete! Output written to public/app.js");