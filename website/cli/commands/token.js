/**
 * Project Atlas — Supporter Token Generator CLI
 * 
 * Usage:
 *   node website/cli/atlas.js token [days]
 *   npm run cli token
 *   npm run cli token 90
 */

export default async function tokenCommand(args = []) {
    const daysArg = parseInt(args[0], 10);
    const days = (!isNaN(daysArg) && daysArg > 0) ? daysArg : 30;

    const SECRET = "AtlasPass2026";
    const now = Date.now();
    const expires = now + (days * 24 * 60 * 60 * 1000);
    const expirationDate = new Date(expires).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const payload = expires.toString() + SECRET;

    // cyrb53 signature generator matching page-builder and resume validation
    const cyrb53 = (str, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };

    const sig = cyrb53(payload).toString(16);
    const tokenObj = { e: expires, s: sig };
    const tokenStr = "Atlas-" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");

    console.log("\n======================================");
    console.log(" ✨ Project Atlas Supporter Token");
    console.log("======================================\n");
    console.log("Generated Token:");
    console.log(`\x1b[36m${tokenStr}\x1b[0m\n`);
    console.log(`Valid for:   ${days} days (Expires: ${expirationDate})`);
    console.log("Scope:       Unlocks /resume/, Akira essay, and all gated supporter content\n");
    console.log("Alternative Master Passcodes (Permanent):");
    console.log("  • supporter2026");
    console.log("  • akira2026");
    console.log("  • atlaspass2026");
    console.log("  • thomsfoolery\n");
    console.log("======================================\n");
}
