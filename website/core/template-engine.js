export default class TemplateEngine {

    render(template, variables) {

        let output = template;

        for (const [key, value] of Object.entries(variables)) {

            output = output.replaceAll(
                `{{${key}}}`,
                () => value
            );

        }

        return output;

    }

}
