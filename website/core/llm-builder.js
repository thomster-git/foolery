export default class LLMBuilder {
    build(content) {
        let output = "PROJECT ATLAS - LLM KNOWLEDGE BASE\n";
        output += "==================================\n\n";
        
        for (const object of content) {
            output += `## [${object.metadata.type}] ${object.metadata.title}\n`;
            if (object.metadata.tags && object.metadata.tags.length > 0) {
                output += `Tags: ${object.metadata.tags.join(", ")}\n`;
            }
            if (object.metadata.created) {
                output += `Created: ${object.metadata.created}\n`;
            }
            output += `URL: ${object.url}\n\n`;
            
            // Clean up the body by removing excessive newlines and HTML tags
            let body = object.body || "";
            // Keep basic markdown structure but it's raw from the parser
            output += body + "\n\n";
            output += "----------------------------------\n\n";
        }
        
        return { text: output };
    }
}
