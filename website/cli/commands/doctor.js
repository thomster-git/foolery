import fs from "fs/promises";

export default async function doctorCommand() {

    console.log("\n======================================");
    console.log(" Atlas Doctor");
    console.log("======================================\n");

    const checks = [

        "../content",
        "../dist",
        "../templates"

    ];

    for (const directory of checks) {

        try {

            await fs.access(directory);

            console.log(`✓ ${directory}`);

        }

        catch {

            console.log(`✖ ${directory}`);

        }

    }

    console.log();

}
