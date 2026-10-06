#!/usr/bin/env node

/**
 * ============================================================
 * Atlas CLI
 * ============================================================
 *
 * The primary command-line interface for Project Atlas.
 *
 * Examples
 * --------
 *
 * node cli/atlas.js build
 *
 * node cli/atlas.js validate
 *
 * node cli/atlas.js stats
 *
 * node cli/atlas.js doctor
 *
 * node cli/atlas.js new article "My Story With Linux"
 *
 */

import buildCommand from "./commands/build.js";
import validateCommand from "./commands/validate.js";
import statsCommand from "./commands/stats.js";
import doctorCommand from "./commands/doctor.js";
import newCommand from "./commands/new.js";
import backupCommand from "./commands/backup.js";

const [, , command, ...args] = process.argv;

async function main() {

    switch (command) {

        case "build":
            await buildCommand(args);
            break;

        case "validate":
            await validateCommand(args);
            break;

        case "stats":
            await statsCommand(args);
            break;

        case "doctor":
            await doctorCommand(args);
            break;

        case "new":
            await newCommand(args);
            break;

        case "backup":
            await backupCommand(args);
            break;

        case "help":
        case "--help":
        case "-h":
        case undefined:
            printHelp();
            break;

        default:
            console.error(`\nUnknown command "${command}".\n`);
            printHelp();
            process.exit(1);

    }

}

function printHelp() {

    console.log(`
======================================
 Project Atlas CLI
======================================

Usage:

    node cli/atlas.js <command>

Commands

    build
        Run the complete Atlas build pipeline.

    validate
        Validate all content without building.

    stats
        Display Atlas statistics.

    doctor
        Run health checks.

    new
        Create a new Atlas object.

Examples

    node cli/atlas.js build

    node cli/atlas.js validate

    node cli/atlas.js new article "My Story With Linux"

`);

}

main().catch(error => {

    console.error(error);
    process.exit(1);

});
