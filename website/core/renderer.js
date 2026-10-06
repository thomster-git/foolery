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

        for (const [key, value] of Object.entries(values)) {

            output = output.replaceAll(
                `{{${key}}}`,
                () => value ?? ""
            );

        }

        return output;

    }

}
