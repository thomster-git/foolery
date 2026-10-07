/**
 * ============================================================
 * Renderer
 * ============================================================
 *
 * Replaces {{placeholders}} inside HTML templates.
 */

export default class Renderer {

    render(template, values = {}) {

        let output = template;

        // Process conditional blocks: {{#if key}}...{{/if}}
        output = output.replace(/\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
            const value = values[key];
            // Treat empty string, null, undefined, false, or "<em>None</em>" as falsy
            if (!value || value === "<em>None</em>") {
                return "";
            }
            return content;
        });

        for (const [key, value] of Object.entries(values)) {

            output = output.replaceAll(
                `{{${key}}}`,
                () => value ?? ""
            );

        }

        return output;

    }

}
