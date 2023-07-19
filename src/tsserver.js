import {
    createDefaultMapFromCDN,
    createSystem,
    createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import lzstring from "lz-string";
import ts from "typescript";
const start = async () => {
    const shouldCache = false;
    const fsMap = await createDefaultMapFromCDN(
        { target: ts.ScriptTarget.ES2015 },
        "3.7.3",
        shouldCache,
        ts,
        lzstring
    );

    fsMap.set("code.ts", "figma");

    const system = createSystem(fsMap);

    const compilerOpts = {
        target: "es6",
        lib: ["es6"],
        strict: true,
    };
    const tsEnv = createVirtualTypeScriptEnvironment(
        system,
        ["code.ts"],
        ts,
        compilerOpts
    );
    const figmaTypes = await Promise.all([
        fetch("https://unpkg.com/@figma/plugin-typings@1.70.0/plugin-api.d.ts"),
        fetch("https://unpkg.com/@figma/plugin-typings@1.70.0/index.d.ts"),
    ]);

    const typesString = (
        await Promise.all(figmaTypes.map((type) => type.text()))
    ).join("\n");

    tsEnv.createFile("plugin-api.d.ts", typesString);

    return tsEnv;
};
let tsEnv = start();
export default tsEnv;
