import esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const rootDir = path.resolve("./");
const lambdaDir = path.resolve(rootDir, "lib", "functions");

const entryPoints = fs.readdirSync(lambdaDir, {recursive: true}).filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

try {
    entryPoints.forEach(async (entry) => {
        await esbuild.build({
            entryPoints: [`./lib/functions/${entry}`],
            bundle: true,
            platform: "node",
            external: ["aws-sdk", "aws-lambda", "commonjs2", ...Object.keys(pkg.peerDependencies || {})],
            outdir: `dist/lambda/${entry.split(".").slice(0, -1).join(".")}`
        });

        console.log(`${entry} successfully built`);
    });
} catch (e) {
    process.exit(1);
}
